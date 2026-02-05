import { Notification } from '../models/index.js';

/**
 * Get user notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 20
        });

        // Count unread
        const unreadCount = await Notification.count({
            where: { user_id: userId, is_read: false }
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, user_id: userId }
        });

        if (notification) {
            notification.is_read = true;
            await notification.save();
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};
