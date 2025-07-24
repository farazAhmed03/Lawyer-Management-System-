const RatingAndReview = require('../Models/RatingAndReview');
const User = require('../Models/User');
const Case = require('../Models/Case');
const mongoose = require('mongoose');
const sendResponse = require('../Utils/Response');



//!=====================================               Create Review          =======================================
const createRateandReview = async (req, res, next) => {
    try {
        const { rating, review } = req.body;
        const lawyerId = req.params.lawyerId;
        const clientId = req.user.userId;

        // Authorization check
        if (req.user.role !== 'client') {
            return sendResponse(res, 403, false, 'Only clients can submit reviews');
        }

        // Validate lawyer
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: 'lawyer'
        });
        if (!lawyer) {
            return sendResponse(res, 404, false, 'Lawyer not found');
        }

        // Check case completion
        const completedCase = await Case.findOne({
            client: clientId,
            lawyer: lawyerId,
            status: 'closed'
        });
        if (!completedCase) {
            return sendResponse(res, 403, false, 'You can only review after completing a case with this lawyer');
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return sendResponse(res, 400, false, 'Rating must be between 1 and 5');
        }

        // Check for existing review
        const existingReview = await RatingAndReview.findOne({
            reviewer: clientId,
            lawyer: lawyerId,
            case: completedCase._id
        });
        if (existingReview) {
            return sendResponse(res, 400, false, 'You have already reviewed this case');
        }

        // Create review
        const newReview = await RatingAndReview.create({
            reviewer: clientId,
            lawyer: lawyerId,
            case: completedCase._id,
            rating,
            review
        });

        // Update lawyer's average rating
        await updateLawyerRating(lawyerId);

        return sendResponse(res, 201, true, 'Review submitted successfully', newReview);

    } catch (error) {
        next(error);
    }
};



//!=====================================               Get Reviews          =======================================
const getRatingAndReviews = async (req, res, next) => {
    try {
        const lawyerId = req.params.lawyerId;

        // Validate lawyer exists
        const lawyer = await User.findById(lawyerId);
        if (!lawyer || lawyer.role !== 'lawyer') {
            return sendResponse(res, 404, false, 'Lawyer not found');
        }

        // Get reviews with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await RatingAndReview.find({ lawyer: lawyerId })
            .populate('reviewer', 'username image')
            .populate('case', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Calculate average rating
        const aggregation = await RatingAndReview.aggregate([
            { $match: { lawyer: new mongoose.Types.ObjectId(lawyerId) } },
            { 
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const stats = aggregation[0] || {
            averageRating: 0,
            totalReviews: 0
        };

        return sendResponse(res, 200, true, 'Reviews fetched successfully', {
            reviews,
            averageRating: stats.averageRating.toFixed(1),
            totalReviews: stats.totalReviews,
            currentPage: page,
            totalPages: Math.ceil(stats.totalReviews / limit)
        });

    } catch (error) {
        next(error);
    }
};



//!=====================================               Update Review          =======================================
const updateRateAndReview = async (req, res, next) => {
    try {
        const { rating, review } = req.body;
        const reviewId = req.params.reviewId;
        const userId = req.user.userId;

        // Find review
        const existingReview = await RatingAndReview.findById(reviewId);
        if (!existingReview) {
            return sendResponse(res, 404, false, 'Review not found');
        }

        // Authorization check
        if (existingReview.reviewer.toString() !== userId) {
            return sendResponse(res, 403, false, 'Not authorized to update this review');
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return sendResponse(res, 400, false, 'Rating must be between 1 and 5');
        }

        // Update review
        existingReview.rating = rating || existingReview.rating;
        existingReview.review = review || existingReview.review;
        existingReview.editedAt = new Date();
        await existingReview.save();

        // Update lawyer's average rating
        await updateLawyerRating(existingReview.lawyer);

        return sendResponse(res, 200, true, 'Review updated successfully', existingReview);

    } catch (error) {
        next(error);
    }
};



//!=====================================               Delete Review          =======================================
const deleteRateAndReview = async (req, res, next) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.user.userId;

        // Find review
        const review = await RatingAndReview.findById(reviewId);
        if (!review) {
            return sendResponse(res, 404, false, 'Review not found');
        }

        // Authorization check
        const isAdmin = req.user.role === 'admin';
        const isOwner = review.reviewer.toString() === userId;
        
        if (!isOwner && !isAdmin) {
            return sendResponse(res, 403, false, 'Not authorized to delete this review');
        }

        // Store lawyer ID before deletion
        const lawyerId = review.lawyer;

        // Delete review
        await RatingAndReview.deleteOne({ _id: reviewId });

        // Update lawyer's average rating
        await updateLawyerRating(lawyerId);

        return sendResponse(res, 200, true, 'Review deleted successfully');

    } catch (error) {
        next(error);
    }
};

// Helper function to update lawyer's average rating
const updateLawyerRating = async (lawyerId) => {
    const aggregation = await RatingAndReview.aggregate([
        { $match: { lawyer: new mongoose.Types.ObjectId(lawyerId) } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = aggregation[0]?.averageRating || 0;

    await User.findByIdAndUpdate(lawyerId, {
        averageRating: averageRating.toFixed(1),
        ratingCount: await RatingAndReview.countDocuments({ lawyer: lawyerId })
    });
};


module.exports = {
    createRateandReview,
    getRatingAndReviews,
    updateRateAndReview,
    deleteRateAndReview
};