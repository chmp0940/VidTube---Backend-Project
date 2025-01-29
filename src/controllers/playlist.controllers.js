import mongoose, { isValidObjectId, set } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const user = req.user?._id;
  if (!user) {
    throw new ApiError(
      401,
      "Unauthorized please check your login details or relogin"
    );
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  console.log(playlist);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found id is incorrect");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist details"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if(!playlistId || !videoId){
    throw new ApiError(400, "Playlist id and video id are required");
  }
  
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found id is incorrect");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found id is incorrect");
  }
  let user = req.user?._id;
  console.log(user, playlist.owner);
  if (!(await playlist.owner.equals(user))) {    //****** IMP ********
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

    
  const updateplaylist=await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push:{
        video:videoId
      }
    },
    {
      new:true
    }

  )


  console.log(updateplaylist);

  return res
          .status(200)
          .json(new ApiResponse(200,updateplaylist , "Video added to playlist"));

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if(!playlistId || !videoId){
    throw new ApiError(400, "Playlist id and video id are required");
  }
  
  let  playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found id is incorrect");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found id is incorrect");
  }
  
    const deletVideo=await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull:{
          video:videoId
        }
      }
    )
    
    console.log(deletVideo);
    return res
              .status(200)  
              .json(new ApiResponse(200,deletVideo , "Video removed from playlist"));



});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found id is incorrect");
  }

  let user = req.user?._id;
  console.log(user,playlist.owner);
  if ( ! await playlist.owner.equals(user)) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  const delPlaylist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, delPlaylist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.findById(playlistId);
  let user = req.user?._id;
  console.log(user, playlist.owner);
  if (!(await playlist.owner.equals(user))) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }


  const updatedplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedplaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  deletePlaylist,
  updatePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist
};
