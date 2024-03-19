import { Router } from 'express';
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js"

const router = Router();

router.route('/stats').get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router