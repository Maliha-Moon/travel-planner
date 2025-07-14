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
    reviewCount: { type: Number, default: 0 },
    budget: {
        totalBudget: { type: Number, default: 0 },
        categories: [{
            name: String,
            allocatedAmount: Number,
            spentAmount: Number,
            percentage: Number
        }],
        expenses: [{
            category: String,
            description: String,
            amount: Number,
            date: Date,
            notes: String
        }],
        currency: { type: String, default: 'USD' },
        exchangeRate: Number
    },
    packingList: {
        items: [{
            name: String,
            category: String,
            quantity: Number,
            packed: Boolean,
            notes: String,
            priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
        }],
        categories: [{
            name: String,
            items: [String]
        }],
        checklist: [{
            name: String,
            completed: Boolean,
            date: Date,
            notes: String
        }],
        weatherBasedItems: [{
            weatherCondition: String,
            items: [String]
        }],
        destinationBasedItems: [{
            destination: String,
            items: [String]
        }]
    },
    travelChecklist: {
        items: [{
            name: String,
            category: String,
            completed: Boolean,
            dueDate: Date,
            notes: String,
            priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
        }],
        categories: [{
            name: String,
            items: [String]
        }],
        progress: {
            completed: Number,
            total: Number,
            percentage: Number
        },
        reminders: [{
            name: String,
            date: Date,
            time: String,
            notes: String,
            notified: Boolean
        }]
    },
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
