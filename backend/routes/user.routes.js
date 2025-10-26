import express from "express";
import protectRoute from "../middlewares/protectRoute.middleware.js";
import { followOrUnfollow, getSuggested, getUserProfile, updateUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggested);
router.post('/follow/:id', protectRoute, followOrUnfollow);
router.post('/update', protectRoute, updateUser);

export default router;