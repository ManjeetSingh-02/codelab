// import package modules
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// import local modules
import { envConfig } from "../env.js";

cloudinary.config({
  cloud_name: envConfig.IMGHANDLER_CLOUD_NAME,
  api_key: envConfig.IMGHANDLER_API_KEY,
  api_secret: envConfig.IMGHANDLER_API_SECRET,
});

// function to upload an image on Cloudinary
export const uploadImageonCloudinary = async localFilePath => {
  try {
    // upload the image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: envConfig.IMGHANDLER_FOLDER_NAME,
      resource_type: "auto",
    });

    // if successfull, return the uploaded image
    return uploadResult;
  } catch (error) {
    // if error, return null
    return null;
  } finally {
    // delete the local file after upload
    fs.unlinkSync(localFilePath);
  }
};

// function to delete an image from Cloudinary
export const deleteImageFromCloudinary = async publicId => {
  // delete the image from Cloudinary
  return await cloudinary.uploader
    .destroy(publicId, {
      resource_type: "image",
    })
    .then(res => res.result === "ok");
};
