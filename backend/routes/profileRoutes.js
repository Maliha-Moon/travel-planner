const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// Profile routes
router.get('/', verifyUser, profileController.getProfile);
router.put('/', verifyUser, profileController.updateProfile);
router.put('/preferences', verifyUser, profileController.updatePreferences);
router.put('/interests', verifyUser, profileController.updateInterests);
router.post('/favorite-destinations', verifyUser, profileController.addFavoriteDestination);
router.get('/favorite-destinations', verifyUser, profileController.getFavoriteDestinations);
router.put('/favorite-destinations/:destinationId', verifyUser, profileController.updateFavoriteDestination);
router.delete('/favorite-destinations/:destinationId', verifyUser, profileController.removeFavoriteDestination);

module.exports = router;
