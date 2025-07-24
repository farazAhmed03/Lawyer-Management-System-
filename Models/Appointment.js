const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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

    date: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isLocked: {
        type: Boolean,
        default: false
    }, 
    
    linkedCase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Appointment', appointmentSchema);
