import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(
      401,
      "Unauthorized please check your login details or relogin"
    );
  }

  const tweet = await Tweet.create({
    owner: user?._id,
    content: content,
  });

  console.log(tweet);

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(
      401,
      "Unauthorized please check your login details or relogin"
    );
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user?._id),
      },
    },
  ]);

  console.log(tweet);

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "User tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  const user = req.user?._id;

  console.log(new mongoose.Types.ObjectId(user?._id));
  const checkTweet = await Tweet.findById(tweetId);
  if (
    !user ||
    !checkTweet.owner.equals(new mongoose.Types.ObjectId(user._id))
  ) {
    throw new ApiError(403, "You are unauthorized to update the tweet");
  }

  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }
  if (!content) {
    throw new ApiError(400, "Content is required to update");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    {
      new: true,
    }
  );
  console.log(tweet);

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const user = req.user?._id;

  console.log(new mongoose.Types.ObjectId(user?._id));
  const checkTweet = await Tweet.findById(tweetId);
  if (!checkTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (
    !user ||
    !checkTweet.owner.equals(new mongoose.Types.ObjectId(user._id))
  ) {
    throw new ApiError(403, "You are unauthorized to delete the tweet");
  }

  try {
    const tweet = await Tweet.findOneAndDelete(tweetId);
    console.log(tweet);
  } catch (error) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
