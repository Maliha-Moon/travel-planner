const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const socialController = require('../controllers/socialController');

// Trip Sharing Routes
router.post('/trips/:tripId/share', verifyUser, socialController.shareTrip);
router.get('/trips/:tripId/shared-users', verifyUser, socialController.getSharedUsers);
router.delete('/trips/:tripId/shared-users/:userId', verifyUser, socialController.unshareTrip);

// Trip Reviews Routes
router.post('/trips/:tripId/reviews', verifyUser, socialController.addTripReview);
router.get('/trips/:tripId/reviews', verifyUser, socialController.getTripReviews);
router.put('/trips/:tripId/reviews/:reviewId', verifyUser, socialController.updateTripReview);
router.delete('/trips/:tripId/reviews/:reviewId', verifyUser, socialController.deleteTripReview);

// Travel Tips Routes
router.post('/tips', verifyUser, socialController.createTravelTip);
router.get('/tips', verifyUser, socialController.getTravelTips);
router.get('/tips/:tipId', verifyUser, socialController.getTravelTip);
router.put('/tips/:tipId', verifyUser, socialController.updateTravelTip);
router.delete('/tips/:tipId', verifyUser, socialController.deleteTravelTip);
router.post('/tips/:tipId/like', verifyUser, socialController.likeTravelTip);
router.delete('/tips/:tipId/like', verifyUser, socialController.unlikeTravelTip);
router.post('/tips/:tipId/comment', verifyUser, socialController.addComment);
router.delete('/tips/:tipId/comments/:commentId', verifyUser, socialController.deleteComment);

// Search Routes
router.get('/search/tips', verifyUser, socialController.searchTravelTips);
router.get('/search/users', verifyUser, socialController.searchUsers);

module.exports = router;
