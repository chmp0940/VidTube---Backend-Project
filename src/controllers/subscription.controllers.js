import mongoose, { isValidObjectId } from "mongoose";

import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
    if(!channelId)
    {
      throw new ApiError(400, "Channel id is required");
    }

    const channel=await User.findById(channelId);
    if(!channel)
    {
      throw new ApiError(404, "Channel not found");
    }

    const subscriber=req.user?._id;
    console.log(subscriber);
    if(!subscriber)
    {
      throw new ApiError(401, "Unauthorized please check your login details or relogin");
    }

    const AlreadySubscribed=await Subscription.aggregate([
      {
        $match:{
          subscriber:new mongoose.Types.ObjectId(subscriber),
          channel:new mongoose.Types.ObjectId(channelId)
        }
      }
    ])


    console.log(AlreadySubscribed.length);
    try {
      if(AlreadySubscribed.length>0)
      {
          const b=! await AlreadySubscribed[0]?.isSubscribed;
          console.log(b);
            const subscriber=  AlreadySubscribed[0]?._id
          const updatedsubsciber = await Subscription.findByIdAndUpdate(
            subscriber,
            {
              $set: {
                isSubscribed: b,
              },
            },
            {
              new: true,
            }
          );
          console.log(updatedsubsciber);
          return res
                    .status(200)
                    .json(new ApiResponse(200,updatedsubsciber,"Subscription toggled successfully"));
      }
      else{
        const newSubscription=await Subscription.create({
          subscriber:subscriber,
          channel:channelId,
          isSubscribed:true
        })
  
        console.log(newSubscription);
        return res
                    .status(200)
                    .json(new ApiResponse(200,newSubscription,"Subscription created successfully"));
      }
    } catch (error) {
      throw new ApiError(500, error.message);
    }
    

});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if(!channelId)
  {
    throw new ApiError(400, "Channel id is required");
  }
  

  const subscibers = await Subscription.aggregate([
    {
      $match: {
        channel:new mongoose.Types.ObjectId(channelId),
        isSubscribed:true
      },
    },
  ]);

  console.log(subscibers.length);
  if(subscibers.length==0)
  {
    throw new ApiError(404, "Subscribers not found");
  }

  console.log(subscibers);
  const n=subscibers.length;
  
  return res
            .status(200)
            .json(new ApiResponse(200,subscibers,`Subscribers fetched successfully- ${n}`));

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if(!subscriberId){
    throw new ApiError(400, "Subscriber id is required");
  }

  const mysubscriptions =await Subscription.aggregate([
    {
      $match:{
        subscriber:new mongoose.Types.ObjectId(subscriberId),
        isSubscribed:true
      }
    }
  ])

  console.log(mysubscriptions.length);
  if(mysubscriptions.length==0)
  {
    throw new ApiError(404, "Subscribed channels not found");
  }

  console.log(mysubscriptions);
  const n=mysubscriptions.length;
  
  return res
            .status(200)
            .json(new ApiResponse(200,mysubscriptions,`Subscribed channels fetched successfully- ${n}`));
});

export {
          toggleSubscription,
          getUserChannelSubscribers,
          getSubscribedChannels  
        }