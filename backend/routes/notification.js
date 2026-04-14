import express from 'express';
import { getNotifications, markAsRead } from '../controller/notificationController.js';
import { verifyToken } from '../middleware/verify.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markAsRead);

export default router;
