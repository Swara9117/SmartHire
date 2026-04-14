import express from 'express';
import { upload, cloudinaryFile} from '../middleware/cloudinary.js';
import { editProfile } from '../controller/userControllers.js';
import { viewProfile } from '../controller/userControllers.js';
import { verifyToken } from '../middleware/verify.js';
const router = express.Router();


// router.post('/upload-resume', upload, cloudinaryFile, (req, res) => {
//   // At this point, req.body.resumeURL has the Cloudinary URL
//   res.json({ message: 'Resume uploaded successfully!', url: req.body.resumeURL });
// });

router.put('/edit-profile/:emailid', verifyToken, editProfile);
router.get('/view-profile/:emailid', verifyToken, viewProfile);

export default router;
