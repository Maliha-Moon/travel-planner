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

// Destinations routes
router.post('/:tripId/destinations', verifyUser, tripController.addDestination);
router.get('/:tripId/destinations', verifyUser, tripController.getDestinations);
router.put('/:tripId/destinations/:destinationId', verifyUser, tripController.updateDestination);
router.delete('/:tripId/destinations/:destinationId', verifyUser, tripController.deleteDestination);

// Expenses routes
router.post('/:tripId/expenses', verifyUser, tripController.addExpense);
router.get('/:tripId/expenses', verifyUser, tripController.getExpenses);
router.put('/:tripId/expenses/:expenseId', verifyUser, tripController.updateExpense);
router.delete('/:tripId/expenses/:expenseId', verifyUser, tripController.deleteExpense);

// Documents routes
router.post('/:tripId/documents', verifyUser, tripController.addDocument);
router.get('/:tripId/documents', verifyUser, tripController.getDocuments);
router.put('/:tripId/documents/:documentId', verifyUser, tripController.updateDocument);
router.delete('/:tripId/documents/:documentId', verifyUser, tripController.deleteDocument);

module.exports = router;
