// owner ObjectId users
//   content string
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //for aggregation pipeline


const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
/*

mongoose.model: This method is used to create a Mongoose model.
"Tweet": This is the name of the model. It represents the Tweet collection in the MongoDB database. Mongoose will automatically pluralize this name to tweets when creating the collection.

*/