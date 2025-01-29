import multer from "multer";

//configuring storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  //In this code, the filename function is a callback that Multer uses to determine the name of the file on the server. It takes three arguments: req (the request object), file (information about the uploaded file), and cb (a callback function to be called once the filename is determined).
  filename: function (req, file, cb) {
    //check it

    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, file.originalname); // Set the filename to the original name of the uploaded file
  },
});

// Create the Multer instance with the storage configuration
export const upload = multer({
  storage,
});
// This saves the file on the server but after that we need to upload this to any cloud storage
