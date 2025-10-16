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
        res.status(500).json({
            error : "Signup internal error"
        })
    }
}

export const login = async (req , res) => {

}

export const logout = async (req , res) => {

}