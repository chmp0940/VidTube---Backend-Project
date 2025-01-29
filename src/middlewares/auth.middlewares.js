import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  // as we would not use res so we use _
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");// this is mostly used on mobile application than req.body this days
  /*
    This part of the code attempts to retrieve the access token from the Authorization header of the request.
    req.header("Authorization") retrieves the value of the Authorization header.
    The optional chaining operator (?.) is used to safely access the replace method, ensuring that it doesn't throw an error if the Authorization header is not present.
    .replace("Bearer ", "") removes the "Bearer " prefix from the token string, leaving only the token itself.Actually it is like this Bearer "some token"
    This is commonly used in API requests where tokens are sent in the Authorization header.
    */
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    // same as seen ealier in decoding the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    )

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // adding more information
    req.user = user;
    /*
    : By setting req.user = user;, you are attaching the authenticated user's information to the request object. This means that the user object will be available as req.user in any subsequent middleware functions or route handlers.
    */
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
})
export { verifyJWT };
