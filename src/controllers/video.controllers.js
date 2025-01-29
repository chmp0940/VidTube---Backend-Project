import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { errorHandler } from "../middlewares/error.middlewares.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found or pls login if you are not");
  }

  const { title, description, duration } = req.body;

  console.log(title, description, duration);

  // TODO: get video, upload to cloudinary, create video

  if (!title || !description || !duration) {
    throw new ApiError(400, "Title or description or duration are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  console.log("videoLocalPath", videoLocalPath);
  console.log("thumbnailLocalPath", thumbnailLocalPath);
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  let VideoFile = null;
  try {
    VideoFile = await uploadOnCloudinary(videoLocalPath);
    console.log("Video uploaded:", VideoFile);
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while uploading the video",
      error
    );
  }

  let thumbnail = null;
  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Thumbnail uploaded:", thumbnail);
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while uploading the thumbnail",
      error
    );
  }

  const video = await Video.create({
    title: title,
    description: description,
    videoFile: VideoFile?.url,
    thumbnail: thumbnail?.url || "",
    duration: duration,
    owner: user._id,
  });
  console.log(video);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found or pls login if you are not");
  }
  console.log(req.body);
  let { page, limit, query, sortBy, sortType, userId } = req.body;
  //TODO: get all videos based on query, sort, pagination
  // const pageNumber = parseInt(page, 10);
  // const limitNumber = parseInt(limit, 10);

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Check if user exists if userId is provided
  if (userId && !(await User.findById(userId))) {
    throw new ApiError(404, "User not found");
  }
  console.log(page, limit, query, sortBy, sortType, userId);

  if (!(await User.findById(userId))) {
    throw new ApiError(404, "User not found");
  }

  if (sortType === "asc") {
    sortType = 1;
  } else if (sortType === "desc") {
    sortType = -1;
  } else {
    throw new ApiError(400, "Invalid sortType");
  }
  console.log(userId);

  page = page ? parseInt(page, 10) : 1;
  limit = limit ? parseInt(limit, 10) : 10;
  const skip = (page - 1) * limit;

  const ownerId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $search: {
        index: "default",
        text: {
          query: query || "", // Replace with your search term
          path: { wildcard: "*" }, // Search all text-based fields
        },
      },
    },
    {
      $match: {
        owner: ownerId,
      },
    },
    {
      $sort: {
        sortBy: sortType,
      },
    },
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
  const video = await Video.aggregate(pipeline);

  console.log(video);
  if (!video) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found or pls login if you are not");
  }

  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found id is incorrect");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video details"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found or pls login if you are not");
  }

  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title or description are required");
  }

  // console.log(title, description);

  const newThumbnail = req.file?.path;
  console.log(newThumbnail);
  if (!newThumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }

  let thumbnail = null;
  if (newThumbnail) {
    try {
      thumbnail = await uploadOnCloudinary(newThumbnail);
      console.log("new thumbnail uploaded :", thumbnail);
    } catch (error) {
      throw new ApiError(
        404,
        video,
        "something went wrong while uploading the new thumbnail"
      );
    }
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail?.url,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found or pls login if you are not");
  }

  const { videoId } = req.params;
  //TODO: delete video

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOneAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  let b = false;

  if (!video.isPublished) {
    b = true;
  }

  const videos = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { isPublished: b },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Video toggled published successfully"));
});

export {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  getAllVideos,
  togglePublishStatus,
};
