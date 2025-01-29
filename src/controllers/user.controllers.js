import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    //small check for user exitense

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // console.log(accessToken);
    // console.log(refreshToken);

    user.refreshToken = refreshToken;
    // console.log(user);

    await user.save({ validateBeforeSave: false }); //This line of code saves the user document to the database. The option { validateBeforeSave: false } is used to skip validation before saving.

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //Destructuring Assignment-Destructuring assignment is a syntax that allows you to unpack values from arrays or properties from objects into distinct variables.

  /*req.body is an object that contains {
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "securepassword"
}


 if this destructuring assignment is not used then it need to be done like this 
const fullname = req.body.fullname;
const email = req.body.email;
const username = req.body.username;
const password = req.body.password;
*/

  //validation-all field required

  if (
    [fullname, email, username, password].some(
      // array of fields
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  /* 
  the .some() method checks if at least one element in the array passes the test implemented by the provided function.
  In this case, the function checks if any of the fields are empty strings after trimming whitespace.
*/

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  /* 
  await: This keyword is used to wait for the User.findOne promise to resolve. This makes the code execution pause until the query completes.

  User.findOne: This is a Mongoose method that searches for a single document in the User collection that matches the given criteria.

  $or: This is a MongoDB logical operator that matches documents where at least one of the specified conditions is true
*/

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  /*Optional Chaining (?.):If any part of the chain is null or undefined, the entire expression will return undefined instead of throwing an error. */

  console.log("Avatar Path:", avatarLocalPath);
  console.log("Cover Image Path:", coverLocalPath);

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is missing");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);

  // let coverImage = "";
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }
  let avatar = null;
  try {
    console.log(avatarLocalPath);
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar uploaded:", avatar);
  } catch (error) {
    console.log("Error uploading avatar:", error);
    throw new ApiError(500, "Error uploading avatar");
  }

  let coverImage = null;
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("coverImageUploaded uploaded:", coverImage);
  } catch (error) {
    console.log("Error uploading coverImage:", error);
    throw new ApiError(500, "Error uploading coverImage");
  }

  // creating on data base
  try {
    /*

    This code snippet creates a new user in the database, retrieves the created user without sensitive fields, and returns a response to the client.
    
    */
    const user = await User.create({
      fullname,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    //extra query
    const createdUser = await User.findById(user.id).select(
      "-password -refreshToken"
    );
    /* This method excludes the password and refreshToken fields from the retrieved document. This is done to avoid sending sensitive information back to the client. */
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating a user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "user registered succesfully"));
  } catch (error) {
    // if something goes wrong while creating user then delete that file from cloudinary also
    console.log("Error creating user:", error);
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(500, "somethign went wrong imagews were deleted");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // get data form body
  const { email, username, password } = req.body;

  //validation
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //validate password
  const isPassworValid = await user.isPasswordCorrect(password);
// console.log(isPassworValid)
  if (!isPassworValid) {
    throw new ApiError(401, "Invalid password");
  }
// console.log(user);
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log(accessToken, refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in");
  }

  const options = {
    httpOnly: true, //makes cookies no changable by client or // This option makes the cookie inaccessible to JavaScript running on the client side.
    secure: process.env.NODE_ENV === "production",
    // This option ensures that the cookie is only sent over HTTPS connections
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/*
This code defines a function called logoutUser that handles the user logout process. 
It clears the user's refresh token from the database and removes the authentication
cookies from the client's browser.
*/
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    // Todo need to comeback here after middleware
    req.user._id, //: The ID of the authenticated user, which is attached to the request object by the authentication middleware.
    {
      $set: {
        refreshToken: undefined, // depends on mongoose version
      }, //$set: { refreshToken: undefined }: This sets the refreshToken field to undefined, effectively clearing the refresh token from the user's document.
    },
    {
      new: true, // This option specifies that the updated document should be returned in the response.
    }
  );

  const options = {
    httpOnly: true, //makes cookies no changable by client or // This option makes th
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options) //clearing the cookies from the clients browser
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // things have expired then give him some route to generte new tokens

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //for mobie apps
  /*
  This part of the code attempts to retrieve the refresh token from the cookies sent with the request.
  req.cookies is an object that contains all the cookies sent by the client. refreshToken is the name of the cookie that stores the refresh token.
  This is commonly used in web applications where tokens are stored in cookies for security reasons. 
*/
  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // Output:
    // {
    //   "_id": "1234567890abcdef",
    //   "email": "user@example.com",
    //   "username": "user123",
    //   "fullName": "John Doe",
    //   "iat": 1616239022,
    //   "exp": 1616242622
    // }

    // takes the incoming token and verifies it with the secret key
    /*
      If the token is valid, decodedToken will contain the decoded payload of the token, which includes the data that was originally encoded in the token.
       */

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true, //makes cookies no changable by client or// Thioptionmakes th
      secure: process.env.NODE_ENV === "production",
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    /*
    This code snippet calls a function to generate a new access token and refresh token for a user, and then destructures the returned object to extract the tokens. The refresh token is renamed to newRefreshToken for clarity.
     */

    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // setting the two cookies
      .cookie("refreshToken", newRefreshToken, options) // name-of-cookie  value-of-cookie setting-of-cookies
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while refreshing access token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = await req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "FIle is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "someting went wrong while uploading the avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  console.log("yes you are in");
  const coverImageLocalPath = await req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "File is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(
      400,
      "something went wrong while uplaoding the cover image"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

/*   res.cookie(name, value, options): This method sets a cookie in the HTTP response.
"accessToken": The name of the first cookie.
accessToken: The value of the first cookie, which is the access token generated for the user.
options: The options object that specifies settings for the cookie (e.g., httpOnly, secure). 
*/

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  console.log(username);
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
        // ye first username database me jo he wo he and seconde wala ho hmne abhi req.param se liya he wo he ok
        // iska matlab ye ki database me aise usernames jo hmne req.params se liya he use match kare wahi data hme lena he ok
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel", // the channel which are having my id are my subcribers
        as: " subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id", // meri id us channel le subscirber se  judi he matlab me us channel ka sunsciber hua
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: { $ifNull: ["$subscribers", []] },
        },
        channelsSubcribedToCount: {
          $size: { $ifNull: ["$subscribedTo", []] },
        }, // below is opitional OKay
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, { $ifNull: ["$subscribers.subscriber", []] }],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      //project only neccesary data
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        avatar: 1,
        channelsSubcribedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromTime(req.user?._id),
      },
    },
    {
      $lookup: 
      {
        from: "Video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:
        [
          {
            $lookup:
            {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: 
              [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user) {
    throw new Error("User not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
