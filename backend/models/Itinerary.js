const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['sightseeing', 'dining', 'activities', 'transport', 'accommodation', 'other'],
        required: true
    },
    notes: String,
    cost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    }
}, {
    timestamps: true
});

const itinerarySchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    activities: [activitySchema],
    totalCost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
