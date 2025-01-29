// id string pk
//   username string
//   email string
//   fullName string
//   avatar string
//   coverImage string
//   watchHistory ObjectId[] videos
//   password string
//   refreshToken string
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true } // for created at and updated at
);

//encrypting the password  prehook-is is a Mongoose middleware that runs before a document is saved (pre-save hook).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only be updated at the time of password not at updatin the username,fullname,etc

  // const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, 10);

  /*
bcrypt is a library used for hashing passwords. It provides a way to securely store
passwords by converting them into a hashed format that is difficult to reverse-engineer.
This helps protect user passwords in case of a data breach
  */

  next(); // going to next middleware,prehook,anything
});

//comparing password at the time of login
userSchema.methods.isPasswordCorrect = async function (password) {
  // console.log("Input password:", password);
  // console.log("Stored hashed password:", this.password);
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  // short lived access token
  // The sign function from the jsonwebtoken (JWT) library is used to create a JSON Web Token (JWT). 
  const b= jwt.sign(
    {
      _id: this._id, // . These are the pieces of information that will be encoded in the token.
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,    //signs the token using the secret key.
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
// console.log(b);
return b;
};
// above code generates the token 
//A JWT typically has three parts: Header, Payload, and Signature. The sign function generates a token that looks like this:

// Header: Contains metadata about the token, such as the signing algorithm.
// Payload: Contains the data you included (e.g., user information).
// Signature: Ensures the token hasn't been tampered with, created using the secret key.

userSchema.methods.generateRefreshToken = function () {
  // short lived access token
  const a=jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  // console.log(a)
  return a;

};
export const User = mongoose.model("User", userSchema);
