import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary} from "cloudinary"

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import connectMongoDB from './db/connectMongoDB.js'

dotenv.config();
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})
const PORT = process.env.PORT || 3000;

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.use('/api/auth' , authRouter)
app.use('/api/user' , userRouter)

app.listen(PORT, () => {
    console.log("server is running")
    connectMongoDB();
});