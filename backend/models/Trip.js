const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    category: { type: String, enum: ['sightseeing', 'dining', 'transport', 'accommodation', 'other'] },
    cost: { type: Number, default: 0 },
    notes: { type: String }
});

const DestinationSchema = new Schema({
    name: { type: String, required: true },
    arrivalDate: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    activities: [ActivitySchema],
    totalCost: { type: Number, default: 0 },
    notes: { type: String }
});

const TripSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    destinations: [DestinationSchema],
    totalCost: { type: Number, default: 0 },
    status: { type: String, enum: ['planning', 'active', 'completed'], default: 'planning' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Calculate total cost for each destination
DestinationSchema.pre('save', function(next) {
    this.totalCost = this.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    next();
});

// Calculate total cost for the trip
TripSchema.pre('save', function(next) {
    this.totalCost = this.destinations.reduce((sum, destination) => sum + destination.totalCost, 0);
    next();
});

module.exports = mongoose.model('Trip', TripSchema);
