import { Router } from "express";

import{ registerUser,
        logoutUser, 
        loginUser, 
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        getUserChannelProfile,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getWatchHistory
        } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
//unsecured  routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

/* 
router.route("/register").post(...): Defines a POST route at the path /register.

upload.fields([...]): This middleware handles file uploads. It specifies that the request can contain two files:
{ name: "avatar", maxCount: 1 }: Allows one file with the field name avatar.
{ name: "coverImage", maxCount: 1 }: Allows one file with the field name coverImage.


registerUser: This is the controller function that will handle the registration logic. It is called after the upload middleware processes the file uploads.
*/

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;

/*When a client sends a POST request to /register with form data that includes avatar and coverImage files, the upload middleware will process the files and make them available in req.files. The registerUser controller function will then handle the registration logic, including saving the user data and uploaded files. */
