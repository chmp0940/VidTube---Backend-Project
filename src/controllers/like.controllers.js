import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(401, "pls login to like or dislike the video");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  console.log(user, video?._id);

  // further can try aggregation as at that time it was don't working so can try for that Later
  const count = await Like.countDocuments({
    likedBy: new mongoose.Types.ObjectId(user),
    video: new mongoose.Types.ObjectId(videoId),
  });
  //counts the number of documents that matches this filter

  console.log(count);

  console.log(count);
  if (count > 0) {
    try {
      const like = await Like.findOne({ likedBy: user, video: videoId });
      console.log(like);
      const likeId = like._id;
      console.log(likeId);
      let b = like.isLiked;

      if (b === false) {
        b = true;
      } else {
        b = false;
      }

      const updateLike = await Like.findByIdAndUpdate(
        likeId,
        {
          $set: {
            isLiked: b,
          },
        },
        {
          new: true,
        }
      );
      console.log(updateLike);

      return res
        .status(200)
        .json(new ApiResponse(200, updateLike, "Like toggled successfully"));
    } catch (error) {
      throw new ApiError(400, "Something went wrong");
    }
  } else {
    let likes = null;
    try {
      likes = await Like.create({
        video: video?._id,
        likedBy: user?._id,
        isLiked: true,
      });
      console.log(likes);
    } catch (error) {
      throw new ApiError(400, "Something went wrong");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likes, "Like toggled successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(404, "commentId is required");
  }

  const user = await req.user?._id;

  if (!user) {
    throw new ApiError(401, "pls login to like or toggle like on the comment");
  }

  const like = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user),
      },
    },
  ]);

  console.log(like);
  try {
    if (like.length > 0) {
      const likeId = like[0]?._id;
      let b = await like[0]?.isLiked;
      console.log(b);
      b = !b;
      console.log(b);
      const updateLike = await Like.findByIdAndUpdate(
        likeId,
        {
          isLiked: b,
        },
        {
          new: true,
        }
      );
      console.log(updateLike);
      return res
        .status(200)
        .json(new ApiResponse(200, updateLike, "Like toggled successfully"));
    } else {
      const like = await Like.create({
        comment: commentId,
        likedBy: user,
        isLiked: true,
      });
      console.log(like);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            like,
            "Like created as it was not yet liked successfully"
          )
        );
    }
  } catch (error) {
    throw new ApiError(400, "Something went wrong");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }

  const user = req.user?._id;
  if (!user) {
    throw new ApiError(401, "pls login to like or toggle like on the tweet");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const like = await Like.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(user),
      },
    },
  ]);

  try {
    if (like.length > 0) {
      const likeID = like[0]?._id;
      let b = await like[0]?.isLiked;
      b = !b;
      const updateLike = await Like.findByIdAndUpdate(
        likeID,
        {
          isLiked: b,
        },
        {
          new: true,
        }
      );

      console.log(updateLike);

      return res
        .status(200)
        .json(new ApiResponse(200, updateLike, "Like toggled successfully"));
    } else {
      const like = await Like.create({
        tweet: tweetId,
        likedBy: user,
        isLiked: true,
      });

      console.log(like);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            like,
            "Like created as it was not yet liked successfully"
          )
        );
    }
  } catch (error) {
    throw new ApiError(400, "Something went wrong");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(401, "pls login to get liked videos");
  }

  const likedVIdeos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user),
        isLiked: true,
        tweet: null,
        comment: null,
      },
    }
  ]);

  console.log(likedVIdeos);
  
      return res
                .status(200)
                .json(new ApiResponse(200, likedVIdeos, "Liked videos fetched successfully"));
});
export { 
        toggleVideoLike, 
        toggleCommentLike,
        toggleTweetLike,
        getLikedVideos
      };
