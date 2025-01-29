import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} from "../controllers/like.controllers.js"

const router=Router();

router.route("/toggle-video-like/:videoId").get(verifyJWT, toggleVideoLike);
router.route("/toggle-comment-like/:commentId").get(verifyJWT, toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").get(verifyJWT, toggleTweetLike);
router.route("/get-liked-videos").get(verifyJWT,getLikedVideos);


export default router;