import {verifyJWT} from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
}  from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/user-playlist/:userId").get(verifyJWT, getUserPlaylists);
router.route("/playlist-byId/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/update-playlist/:playlistId").patch(verifyJWT,updatePlaylist)
router.route("/add-videoTo-playlist/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist);
router.route("/delete-videofrom-Playlist/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist);

export default router;