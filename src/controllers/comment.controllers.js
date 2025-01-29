import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { errorHandler } from "../middlewares/error.middlewares.js";

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const videos = await Video.findById(videoId);
  if (!videos) {
    throw new ApiError(404, "Video not found");
  }
  const user = req.user?._id;
  console.log(videos);
  if (!user) {
    throw new ApiError(401, "User not found or pls login if you are not");
  }
  const comment = await Comment.create({
    content,
    video: videos?._id,
    owner: user._id,
  });

  console.log(comment);

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  let comments = null;
  try {
    comments = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Error updating comment or cannot find the comment "
    );
  }

  console.log(comments);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  console.log(commentId);
  const comment = await Comment.findByIdAndDelete(commentId);
  // console.log(comment);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  console.log(videoId);
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId), // actually the videoID that we give in params are string and  then we needt o convert it to Object Id to use it 
      },
    },
    {
      $limit: limit,
    },
    {
      $skip: (page - 1) * limit,
    },
  ]);

  console.log(comments);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
