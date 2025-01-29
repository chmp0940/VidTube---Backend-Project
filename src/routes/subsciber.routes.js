import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
        getSubscribedChannels,
        getUserChannelSubscribers,
        toggleSubscription
        } from "../controllers/subscription.controllers.js";


const router = Router();

router
  .route("/toggle-subscription/:channelId")
  .patch(verifyJWT, toggleSubscription);

  router.route("/getsubscibers/:channelId").get(verifyJWT,getUserChannelSubscribers)
  router
    .route("/get-my-subscibers/:subscriberId")
    .get(verifyJWT, getSubscribedChannels);


export default router;