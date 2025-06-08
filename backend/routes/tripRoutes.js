const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const tripController = require('../controllers/tripController');

// Trip routes
router.post('/', verifyUser, tripController.createTrip);
router.get('/', verifyUser, tripController.getTrips);
router.get('/:tripId', verifyUser, tripController.getTrip);
router.put('/:tripId', verifyUser, tripController.updateTrip);
router.delete('/:tripId', verifyUser, tripController.deleteTrip);
router.post('/:tripId/share', verifyUser, tripController.shareTrip);

module.exports = router;
