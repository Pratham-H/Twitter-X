import express from "express"
import { signup, login , logout, authCheck } from "../controllers/auth.controller.js";
import {protectRoute} from "../middlewares/protectRoute.middleware.js";

const router = express.Router();

router.post('/signup' , signup);
router.post('/login' , login);
router.post('/logout' , logout);
router.get('/me' ,protectRoute, authCheck)

export default router;