import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const upload = multer({ dest: 'uploaded' }).single('resume'); 

export const cloudinaryFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload the file to Cloudinary as a raw file (for PDFs, docs, etc.)
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',     // important for PDFs and non-images
      folder: 'resume',        
      public_id: req.file.originalname.split('.')[0], 
    });

    req.body.resumeURL = result.secure_url;

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete local file:', err);
    });

    next();
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    res.status(500).json({ message: 'Resume upload failed', error });
  }
};

