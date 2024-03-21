import { Router } from 'express';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription,} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/channel/:channelId")
    .get(verifyJWT, getUserChannelSubscribers)
    .post(verifyJWT, toggleSubscription);

router.route("/user/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router