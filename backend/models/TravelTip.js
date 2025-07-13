const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TravelTipSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'packing', 'safety', 'budgeting', 'transport', 'accommodation', 'activities', 'food', 'culture', 'health']
    },
    tags: [{
        type: String,
        trim: true
    }],
    location: {
        name: String,
        country: String,
        coordinates: {
            type: [Number],  // [longitude, latitude]
            index: '2dsphere'
        }
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better performance
TravelTipSchema.index({ title: 'text', content: 'text', tags: 'text' });
TravelTipSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TravelTip', TravelTipSchema);
