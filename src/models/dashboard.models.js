import mongoose, { Schema } from "mongoose";

const dashboardSchema = new Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: [
      {
        type: String,
      },
    ],
    subscibers: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: String,
      },
    ],
    views: [
      {
        type: String,
      },
    ],
    tweets: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Dashboard = mongoose.model("Dashboard", dashboardSchema);
