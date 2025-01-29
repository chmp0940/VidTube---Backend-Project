import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // builtin module in node itself
import dotenv from "dotenv";

dotenv.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // if file is not found return null (localFilePath)

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // allows Cloudinary to automatically detect the file type
    });

    console.log("File Uploaded on cloudinary. File: " + response.url);
    // once the file is uploaded on cloudinary we can delete it from our server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure the local file is deleted even if upload fails
    }
    return null;
  }
};

const deleteFromCloudinary=async (publicId)=>{
  try {
const result=  await cloudinary.uploader.destroy(publicId)
console.log("file deleted from cloudinary ",publicId)
  } catch (error) {
    console.log("Error deletin from cloudinary",error)
    return null 
  }
}

export { uploadOnCloudinary ,deleteFromCloudinary};
