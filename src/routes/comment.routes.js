import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.controllers.js";

const router=Router();

router.route("/add-comment/:videoId").patch(verifyJWT, addComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);
router.route("/get-all-comments/:videoId").get(verifyJWT,getVideoComments);

export default router;