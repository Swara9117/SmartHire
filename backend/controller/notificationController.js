import Notification from '../models/notification.js';
import { sendNotificationToUser } from '../app.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// Create a notification
export const createNotification = async (userId, message) => {
  const notification = new Notification({ user: userId, message });
  await notification.save();
  
  // Send real-time notification via WebSocket
  sendNotificationToUser(userId, notification);
  
  return notification;
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};
