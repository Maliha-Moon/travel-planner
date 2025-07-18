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
});

const TripSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    destinations: [DestinationSchema],
    expenses: [ExpenseSchema],
    documents: [DocumentSchema],
    sharedWith: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        sharedDate: { type: Date, default: Date.now }
    }],
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
    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    integrations: {
        flights: {
            searchParams: {
                origin: String,
                destination: String,
                departureDate: Date,
                returnDate: Date,
                passengers: {
                    adults: Number,
                    children: Number,
                    infants: Number
                },
                cabinClass: { type: String, enum: ['economy', 'premium', 'business', 'first'] },
                currency: String
            },
            results: [{
                airline: String,
                flightNumber: String,
                departure: {
                    airport: String,
                    time: Date
                },
                arrival: {
                    airport: String,
                    time: Date
                },
                duration: String,
                price: {
                    amount: Number,
                    currency: String
                },
                stops: Number,
                bookingLink: String,
                rating: Number
            }]
        },
        hotels: {
            searchParams: {
                destination: String,
                checkIn: Date,
                checkOut: Date,
                guests: Number,
                rooms: Number,
                amenities: [String],
                priceRange: {
                    min: Number,
                    max: Number
                },
                rating: {
                    min: Number,
                    max: Number
                }
            },
            results: [{
                name: String,
                address: String,
                rating: Number,
                price: {
                    amount: Number,
                    currency: String
                },
                amenities: [String],
                distanceToCenter: Number,
                photos: [String],
                bookingLink: String,
                availableRooms: Number
            }]
        },
        insurance: {
            recommendations: [{
                provider: String,
                coverageType: { type: String, enum: ['medical', 'trip_cancellation', 'baggage', 'emergency', 'comprehensive'] },
                coverageAmount: Number,
                price: {
                    amount: Number,
                    currency: String
                },
                features: [String],
                rating: Number,
                coverageDetails: {
                    medical: Number,
                    tripCancellation: Number,
                    baggage: Number,
                    emergencyEvacuation: Number,
                    sportsCoverage: Boolean,
                    adventureActivities: Boolean
                },
                bookingLink: String
            }]
        }
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
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
