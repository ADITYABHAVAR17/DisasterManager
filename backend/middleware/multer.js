import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "DisasterConnect_Reports",
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
    resource_type: "auto", // Automatically detect resource type
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log("Multer fileFilter - File:", file);
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log("File type not allowed:", file.mimetype);
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
