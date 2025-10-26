import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"

import notification from "../models/notifications.model.js"
import User from "../models/user.model.js"


export const getUserProfile = async (req ,res) => {
    const {username} = req.params
    try {
        const user = await User.findOne({username}).select("-password")
        if(!user){
            return res.status(401).json({
                error : "User not found"
            })
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(`Error getUserProfile: ${error.message}`)
        res.status(500).json({
            error : error.message
        })
    }
}

export const followOrUnfollow = async (req ,res) => {
    try {
        const { id } = req.params
        const currUser = await User.findById(req.user._id)
        const userToModify = await User.findById(id)
        if(id == req.user._id.toString()){
            return res.status(400).json({
                error : "You cant follow/unfollow yourself"
            })
        }
        if(!currUser || !userToModify){
            return res.status(400).json({
                error : "User not found"
            })
        }
        const isFollowing = currUser.following.includes(id)
        if(isFollowing){
            // then unfollow
            await User.findByIdAndUpdate(id , {$pull:{ followers : req.user._id}})
            await User.findByIdAndUpdate(req.user._id , {$pull : {following : id}})
            res.status(200).json({
                msg : "user unfollowed"
            })
        }
        else{
            // then follow
            await User.findByIdAndUpdate(id , {$push:{ followers : req.user._id}})
            await User.findByIdAndUpdate(req.user._id , {$push : {following : id}})
            const newNotification = new notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save()
            res.status(200).json({
                msg : "user followed successfully"
            })
        }
    } catch (error) {
        console.log(`Error followOrUnfollow: ${error.message}`)
        res.status(500).json({
            error : error.message
        })
    }
}

export const getSuggested = async (req, res) =>{
    try {
        const userId = req.user._id
        const userFollowed = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne : userId}
                }
            },
            {$sample:{size : 10}}
        ])
        const filteredUsers = users.filter(user => !userFollowed.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4)
        suggestedUsers.forEach(user => user.password = null)

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log(`Error getSuggested: ${error.message}`)
        res.status(500).json({
            error : error.message
        })
    }
}

export const updateUser = async (req ,res) => {
    const {username, firstname, lastname, email, currPassword, newPassword, bio, link} = req.body
    let {profileImg, coverImg} = req.body
    const userId = req.user._id
    try {
        let user = await User.findById(userId) 
        if(!user){
            return res.status(400).json({
                error : "user not found"
            })
        }
        if(!currPassword && newPassword || !newPassword && currPassword){
            return res.status(400).json({
                error : "enter both current and new password"
            })
        }
        if(currPassword && newPassword){
            const isMatch = await bcrypt.compare(currPassword,user.password)
            if(!isMatch){
                return res.status(400).json({
                    error : "current password is incorrect"
                })
            }
            if(newPassword.length < 6){
                return res.status(400).json({
                    error : "password must be at least 6 characters long"
                })
            }
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword,salt)
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;

        }
        if(coverImg){
             if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;

        }

        user.username = username || user.username
        user.firstName = firstname || user.firstName
        user.lastName = lastname || user.lastName
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        user.password = null;
        return res.status(200).json(user)
    } catch (error) {
        console.log(`Error updateUser: ${error.message}`)
        res.status(500).json({
            error : error.message
        })
    }
}
