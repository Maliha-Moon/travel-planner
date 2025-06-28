const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Trip = require('../models/Trip');

// Get all activities for a trip
router.get('/:tripId/activities', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Filter activities by destination
        const activities = trip.destinations.reduce((acc, dest) => {
            return [...acc, ...dest.activities];
        }, []);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add activity to a destination
router.post('/:tripId/destinations/:destinationId/activities', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const destination = trip.destinations.id(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const activity = {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            category: req.body.category,
            cost: req.body.cost,
            notes: req.body.notes
        };

        destination.activities.push(activity);
        await trip.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update activity
router.put('/:tripId/destinations/:destinationId/activities/:activityId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const destination = trip.destinations.id(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        const activity = destination.activities.id(req.params.activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        activity.set(req.body);
        await trip.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete activity
router.delete('/:tripId/destinations/:destinationId/activities/:activityId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const destination = trip.destinations.id(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        destination.activities.id(req.params.activityId).remove();
        await trip.save();
        res.json({ message: 'Activity removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
