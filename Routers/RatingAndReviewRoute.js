
const express = require('express');
const router = express.Router();
const auth = require('../Middleware/authMiddleware');
const RatingAndReviewController = require('../Controllers/RatingAndReviewController');

// Routes
router.post('/:lawyerId', auth, RatingAndReviewController.createRateandReview);
router.get('/:lawyerId', auth, RatingAndReviewController.getRatingAndReviews);
router.put('/:reviewId', auth, RatingAndReviewController.updateRateAndReview);
router.delete('/:reviewId', auth, RatingAndReviewController.deleteRateAndReview);


module.exports = router;