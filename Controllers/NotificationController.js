const Notification = require('../Models/Notification');
const sendResponse = require('../Utils/Response');


//! =================                 Send Notification                  =====================
const sendNotification = async (userId, type, message, relatedId, relatedModel, io) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            message,
            relatedId,
            relatedModel,
            isRead: false
        });

        const populated = await Notification.findById(notification._id)
            .populate('user', 'username email')
            .populate('relatedId');

        if (io) {
            io.to(userId.toString()).emit('newNotification', populated);
        }

        return { success: true, data: populated };

    } catch (error) {
        return { success: false, message: error.message };
    }
};


//! =================                 Get Notifications                  =====================
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return sendResponse(res, 200, true, 'Notifications fetched', notifications);

    } catch (error) {
        next(error);
    }
};



module.exports = {
    sendNotification,
    getNotifications
};