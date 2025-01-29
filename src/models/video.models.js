// owner ObjectId users
//   videoFile string
//   thumbnail string
//   title string
//   description string
//   duration number
//   views number
//   isPublished boolean
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";  // Schema: A constructor from mongoose used to define the schema for the video collection.
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //for aggregation pipeline

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //clouniary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);  

export const Video = mongoose.model("Video", videoSchema);
//Video: Creates a model named Video using the videoSchema. This model represents the videos collection in the database.



//In MongoDB, a schema is a blueprint or structure that defines the shape and content of documents within a collection. It specifies what fields a document can have, the data types of those fields, and any constraints or validations that should be applied to the data.