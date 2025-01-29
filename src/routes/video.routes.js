import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

// router.route("/:videoId").get(verifyJWT, getVideoById);
router.route("/getvideobyId/:videoId").get(verifyJWT, getVideoById);
router
  .route("/update-video/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router.route("/get-all-videos").post(verifyJWT, getAllVideos);

router
  .route("/togglepublishstatus/:videoId")
  .get(verifyJWT, togglePublishStatus);

export default router;
