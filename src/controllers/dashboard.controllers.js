import mongoose, { isValidObjectId } from "mongoose";

import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Like } from "../models/like.models.js";
import { Dashboard } from "../models/dashboard.models.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { ChannelId } = req.params;

  if (!ChannelId) {
    throw new ApiError(400, "Channel id is required");
  }

  const channel = await User.findById(ChannelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const alreadyDashboardCreated = await Dashboard.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(ChannelId),
      },
    },
  ]);
  console.log(alreadyDashboardCreated);

  if(alreadyDashboardCreated.length>0)
  {
    return res
    .status(200)
    .json(new ApiResponse(200, alreadyDashboardCreated[0], "Dashboard was already created and successfully fetched"));
  }

  try {
    const video = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ChannelId),
        },
      },
    ]);

    // console.log(video);
    const totalvideos = video.length;
    console.log(totalvideos);

    const totalviews = await video.reduce((accumulator, currentvalue) => {
      return accumulator + (currentvalue.views || 0);
    }, 0);

    console.log(totalviews);

    const Subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(ChannelId),
        },
      },
    ]);
    // console.log(Subscribers);
    const totalSubscriber = Subscribers.length;
    console.log(totalSubscriber);

    let videoId = video.map((item) => {
      item._id;
    });

    const like = await Promise.all(
      videoId.map(async (id) => {
        await Like.aggregate([
          {
            $match: {
              video: new mongoose.Types.ObjectId(id),
            },
          },
        ]);
      })
    );

    // console.log(like);
    const totallikes = like.length;
    console.log(totallikes);
    videoId = video.map((item) => {
      item._id;
    });

    // console.log(videoId);
    const comments = await Promise.all(
      videoId.map(async (id) => {
        await Comment.aggregate([
          {
            $match: {
              video: new mongoose.Types.ObjectId(id),
            },
          },
        ]);
      })
    );

    // console.log(comments);

    const totalcomments = comments.length;
    console.log(totalcomments);

    videoId = video.map((item) => {
      item._id;
    });

    const tweets = await Promise.all(
      videoId.map(async (id) => {
        await Tweet.aggregate([
          {
            $match: {
              video: new mongoose.Types.ObjectId(id),
            },
          },
        ]);
      })
    );

    // console.log(tweets);

    const totaltweets = tweets.length;
    console.log(totaltweets);
    const dashboard = await Dashboard.create({
      channel: channel._id,
      videos: totalvideos,
      subscibers: totalSubscriber,
      likes: totallikes,
      comments: totalcomments,
      tweets: totaltweets,
      views: totalviews,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, dashboard, "Channel stats fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { ChannelId } = req.params;

  if (!ChannelId) {
    throw new ApiError(400, "Channel id is required");
  }

  const tempchannel = await User.findById(ChannelId);
  if (!tempchannel) {
    throw new ApiError(404, "Channel not found");
  }

  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(ChannelId),
      },
    },
  ]);

  console.log(video);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
