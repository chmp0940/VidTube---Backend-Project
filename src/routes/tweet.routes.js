import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controllers.js";


const router = Router();

router.route("/add-tweet").post(verifyJWT, createTweet);
router.route("/user-tweet").get(verifyJWT,getUserTweets);
router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet)
router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet)
export default router;