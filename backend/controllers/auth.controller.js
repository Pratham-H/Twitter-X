import zod from "zod"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/generateToken.utils.js"

const SignupZodSchema = zod.object({
    username : zod.string(),
    firstName : zod.string(),
    lastName : zod.string(),
    email : zod.email(),
    password : zod.string()
})
const LoginZodSchema = zod.object({
    username : zod.string(),
    password : zod.string(),
})

export const signup = async (req, res) => {
    try{
    const parsedBody = SignupZodSchema.safeParse(req.body);
    const {firstName , lastName , username , email , password} = parsedBody.data;
    if(!parsedBody.success){
        return res.status(400).json({
            error : "Error in Signup , invaild inputs"
        })
    }
    // cheking if username is already taken
    const existingUser = await User.findOne({username})
    if(existingUser){
        return res.status(400).json({
            error : "Username already exists"
        })
    }
    // checking if Email is already taken
    const existingEmail = await User.findOne({email})
    if(existingEmail){
        return res.status(400).json({
            error : "Username already taken"
        })
    }
    // hashing password before saving it to the DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    
    const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password : hashedPassword,
    })
    if(newUser){
        // generateTokenAndSetCookie function is in utils
        generateTokenAndSetCookie(newUser._id,res);
        await newUser.save();

        res.status(201).json({
        _id : newUser._id,
        firstName : newUser.firstName,
        lastName : newUser.lastName,
        email : newUser.email,
        followers : newUser.followers,
        following : newUser.following,
        profileImg : newUser.profileImg,
        coverImg : newUser.coverImg
        })
    }
    else{
        return res.status(400).json({
            error : "Invalid user data"
        })
    }
    }
    catch(error){
        console.error(`Error Signup: ${error.message}`)
        res.status(500).json({
            error : "Signup internal error"
        })
    }
}

export const login = async (req , res) => {
    try {
        const parsedBody = LoginZodSchema.safeParse(req.body)
        if(!parsedBody.success){
            return res.status(500).json({
                error : "invalid input"
            })
        }
        const {username , password} = parsedBody.data
        const user = await User.findOne({username})
        const isPassCorr = await bcrypt.compare(password,user?.password || "")
        if(!user || !isPassCorr){
            return res.status(400).json({
                error : "Invalid username or password"
            })
        }
        generateTokenAndSetCookie(user._id,res)
        res.status(200).json({
            _id : user._id,
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            followers : user.followers,
            following : user.following,
            profileImg : user.profileImg,
            coverImg : user.coverImg
        })
    } catch (error) {
        console.error(`Error Login: ${error.message}`)
        res.status(500).json({
            error : "Login internal Error"
        })
    }
}

export const logout = async (req , res) => {
    try {
        res.cookie("jwt" , "", {mazAge : 0})
        res.status(200).json({
            msg : "Logged out succesfully"
        })
    } catch (error) {
        console.error(`Error logout: ${error.message}`)
        res.status(500).json({
            error : "Logout internal Error"
        })
    }
}

export const authCheck = async (req , res) =>{
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.error(`Error authcheck: ${error.message}`)
       res.status(500).json({
            error : "Authcheck internal Error"
        }) 
    }
}