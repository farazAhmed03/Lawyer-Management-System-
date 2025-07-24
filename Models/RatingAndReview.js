const mongoose = require('mongoose');

const RatingAndReviewSchema = new mongoose.Schema({

    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    review: {
        type: String,
        trim: true,
        required: true,
    },

    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        default: null,
    },

}, {
    timestamps: true,
});

// Prevent duplicate review per client + lawyer
// reviewSchema.index({ reviewer: 1, lawyer: 1 }, { unique: true });

module.exports = mongoose.model('RatingAndReview', RatingAndReviewSchema);
