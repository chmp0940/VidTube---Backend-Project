//  subscriber ObjectId users
//   channel ObjectId users
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {  //whom you are subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isSubscribed:{
      type:Boolean,
      default:false,
      required:true
    }
  },
  {
    timestamps: true,
  }
);
export const Subscription=mongoose.model("Subscription",subscriptionSchema)