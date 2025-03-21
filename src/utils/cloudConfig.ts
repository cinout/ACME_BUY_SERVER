import { v2 as cloudinary } from "cloudinary";
import {
  cloudinaryAPIKey,
  cloudinaryAPISecret,
  cloudinaryName,
} from "./config";

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryAPIKey,
  api_secret: cloudinaryAPISecret,
  secure: true,
});

export default cloudinary;
