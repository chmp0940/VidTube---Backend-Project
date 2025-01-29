import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv"

const app = express();

//middle wares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //Specifies the allowed origin(s) for requests. This value is taken from the environment variable
    credentials: true, // Indicates whether or not the response to the request can be exposed when the credentials flag is true.
  })
);

// common middle ware
app.use(express.json({ limit: "32kb" })); //parsing data in json
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //This middleware parses incoming requests with URL-encoded payloads (typically from HTML forms) and makes the parsed data available in
app.use(express.static("public")); // his middleware serves static files (e.g., HTML, CSS, JavaScript, images) from the public directory. When a request matches a file in the public directory, the file is served directly without any further processing by other middleware or route handlers.

app.use(cookieParser());

// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriberRouter from "./routes/subsciber.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import {errorHandler} from "./middlewares/error.middlewares.js";


//routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/like",likeRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/subscriber",subscriberRouter);
app.use("/api/v1/dashboard",dashboardRouter);

//extra
app.use(errorHandler)
export { app };
