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

const ExpenseSchema = new Schema({
    category: { type: String, required: true, enum: ['accommodation', 'transport', 'food', 'activities', 'other'] },
    amount: { type: Number, required: true },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const DocumentSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    fileUrl: { type: String, required: true },
    notes: { type: String },
    uploadedAt: { type: Date, default: Date.now }
});

const TripSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    destinations: [DestinationSchema],
    expenses: [ExpenseSchema],
    documents: [DocumentSchema],
    totalCost: { type: Number, default: 0 },
    status: { type: String, enum: ['planning', 'active', 'completed'], default: 'planning' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Calculate total cost for the trip
TripSchema.pre('save', function(next) {
    let total = 0;
    
    // Add destination costs
    this.destinations.forEach(destination => {
        total += destination.totalCost;
    });
    
    // Add expense amounts
    this.expenses.forEach(expense => {
        total += expense.amount;
    });
    
    this.totalCost = total;
    next();
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
