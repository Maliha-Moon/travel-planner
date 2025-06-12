const Trip = require('../models/Trip');

// Create a new trip
exports.createTrip = async (req, res) => {
    try {
        const tripData = {
            ...req.body,
            userId: req.user.id
        };
        
        const trip = new Trip(tripData);
        await trip.save();
        
        res.status(201).json({
            message: 'Trip created successfully',
            trip: trip
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating trip',
            error: error.message
        });
    }
};

// Add destination to a trip
exports.addDestination = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const destination = {
            ...req.body,
            activities: []
        };
        trip.destinations.push(destination);
        await trip.save();

        res.status(201).json({
            message: 'Destination added successfully',
            destination: destination
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding destination',
            error: error.message
        });
    }
};

// Get all destinations for a trip
exports.getDestinations = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json({
            destinations: trip.destinations
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching destinations',
            error: error.message
        });
    }
};

// Add expense to a trip
exports.addExpense = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const expense = {
            ...req.body,
            timestamp: new Date()
        };
        trip.expenses.push(expense);
        await trip.save();

        res.status(201).json({
            message: 'Expense added successfully',
            expense: expense
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding expense',
            error: error.message
        });
    }
};

// Add document to a trip
exports.addDocument = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const document = {
            ...req.body,
            uploadedAt: new Date()
        };
        trip.documents.push(document);
        await trip.save();

        res.status(201).json({
            message: 'Document added successfully',
            document: document
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding document',
            error: error.message
        });
    }
};

// Get all documents for a trip
exports.getDocuments = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.json({
            documents: trip.documents
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
};

// Get all trips for a user
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user.id })
            .populate('userId', 'username')
            .populate('sharedWith', 'username');
        
        res.json({
            trips: trips
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching trips',
            error: error.message
        });
    }
};

// Get a single trip
exports.getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('userId', 'username')
            .populate('sharedWith', 'username');
        
        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found'
            });
        }

        // Check if user has access to this trip
        if (trip.userId.toString() !== req.user.id && 
            !trip.sharedWith.some(id => id.toString() === req.user.id)) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        res.json({
            trip: trip
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching trip',
            error: error.message
        });
    }
};

// Update a trip
exports.updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found'
            });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        Object.assign(trip, req.body);
        await trip.save();
        
        res.json({
            message: 'Trip updated successfully',
            trip: trip
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating trip',
            error: error.message
        });
    }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found'
            });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        await trip.deleteOne();
        
        res.json({
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting trip',
            error: error.message
        });
    }
};

// Share trip with other users
exports.shareTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found'
            });
        }

        // Check if user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        // Add new users to sharedWith array
        const { userIds } = req.body;
        trip.sharedWith = [...new Set([...trip.sharedWith, ...userIds])];
        await trip.save();
        
        res.json({
            message: 'Trip shared successfully',
            trip: trip
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sharing trip',
            error: error.message
        });
    }
};
