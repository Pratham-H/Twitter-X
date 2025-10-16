import mongoose, { mongo } from "mongoose";

const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    firstName : {
        type : String,
        required : true,
    },
    lastName : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : []
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            default : []
        }
    ],
    profileImg : {
        type : String,
        default : ""
    },
    coverImg : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    link : {
        type : String,
        default : ""
    }


},{timestamps : true});

const User = mongoose.model("User" , UserSchema);

export default User;