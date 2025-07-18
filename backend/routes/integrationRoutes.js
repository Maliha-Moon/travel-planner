const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/authMiddleware');
const { searchFlights, searchHotels, getInsuranceRecommendations } = require('../controllers/integrationController');

// Flight Integration
router.post('/flights/search', verifyUser, searchFlights);

// Hotel Integration
router.post('/hotels/search', verifyUser, searchHotels);

// Insurance Integration
router.post('/insurance/recommendations', verifyUser, getInsuranceRecommendations);

module.exports = router;
