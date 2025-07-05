const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// Get all itineraries for a specific trip
router.get('/trip/:tripId', auth, async (req, res) => {
    try {
        const itineraries = await Itinerary.find({ tripId: req.params.tripId })
            .sort({ date: 1 });
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get itinerary for a specific date
router.get('/trip/:tripId/:date', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({
            tripId: req.params.tripId,
            date: new Date(req.params.date)
        });
        res.json(itinerary || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create/update itinerary for a specific date
router.post('/trip/:tripId/:date', auth, async (req, res) => {
    try {
        const { activities } = req.body;
        
        // Calculate total cost
        const totalCost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);

        let itinerary = await Itinerary.findOne({
            tripId: req.params.tripId,
            date: new Date(req.params.date)
        });

        if (!itinerary) {
            itinerary = new Itinerary({
                tripId: req.params.tripId,
                date: new Date(req.params.date),
                activities,
                totalCost,
                currency: activities[0]?.currency || 'USD'
            });
        } else {
            itinerary.activities = activities;
            itinerary.totalCost = totalCost;
            itinerary.currency = activities[0]?.currency || 'USD';
        }

        await itinerary.save();
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete activity from itinerary
router.delete('/trip/:tripId/:date/activity/:activityId', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({
            tripId: req.params.tripId,
            date: new Date(req.params.date)
        });

        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        itinerary.activities = itinerary.activities.filter(
            activity => activity._id.toString() !== req.params.activityId
        );

        await itinerary.save();
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
