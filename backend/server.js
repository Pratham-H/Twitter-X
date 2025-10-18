import express from 'express'
import dotenv from 'dotenv'
import authRouter from './routes/auth.routes.js'
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use('/api/auth' , authRouter);


app.listen(PORT, () => {
    console.log("server is running")
    connectMongoDB();
});