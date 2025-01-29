import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
        getChannelStats,
        getChannelVideos
} from "../controllers/dashboard.controllers.js";


const router = Router();

router.route("/channel-stats/:ChannelId").get(verifyJWT, getChannelStats);

router.route("/all-videos/:ChannelId").get(verifyJWT, getChannelVideos);
export default router;