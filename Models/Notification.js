const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    type: {
        type: String,
        enum: ['appointment', 'case_update', 'review', 'other'],
        required: true,
    },

    message: {
        type: String,
        required: true,
        trim: true,
    },

    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel',
    },

    relatedModel: {
        type: String,
        enum: ['Case', 'Appointment', 'RatingAndReview'],
    },

    read: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
