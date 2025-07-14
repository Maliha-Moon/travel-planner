const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/authMiddleware');
const { getBudgetUsage, updateBudget, generatePackingList, updatePackingList, getChecklist, updateChecklist } = require('../controllers/planningController');

// Budget routes
router.get('/trips/:tripId/budget', verifyUser, getBudgetUsage);
router.put('/trips/:tripId/budget', verifyUser, updateBudget);

// Packing list routes
router.get('/trips/:tripId/packing-list', verifyUser, generatePackingList);
router.put('/trips/:tripId/packing-list', verifyUser, updatePackingList);

// Travel checklist routes
router.get('/trips/:tripId/checklist', verifyUser, getChecklist);
router.put('/trips/:tripId/checklist', verifyUser, updateChecklist);

module.exports = router;
