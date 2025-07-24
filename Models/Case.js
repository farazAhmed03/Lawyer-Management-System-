const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
    },

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    file: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'closed', 'dismissed'],
        default: 'pending',
    },

    isLocked: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
