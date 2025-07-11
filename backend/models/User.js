const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        bio: {
            type: String,
            maxlength: 500
        },
        profilePicture: {
            type: String,
            default: ''
        },
        travelPreferences: {
            budget: {
                type: String,
                enum: ['budget', 'moderate', 'luxury'],
                default: 'moderate'
            },
            accommodation: [{
                type: String,
                enum: ['hostel', 'hotel', 'airbnb', 'camping', 'luxury'],
                default: []
            }],
            transportation: [{
                type: String,
                enum: ['bus', 'train', 'flight', 'car', 'bike', 'walk'],
                default: []
            }],
            activities: [{
                type: String,
                enum: ['sightseeing', 'adventure', 'culture', 'food', 'nature', 'shopping', 'relaxation'],
                default: []
            }]
        },
        interests: [{
            type: String,
            enum: ['history', 'architecture', 'food', 'nature', 'culture', 'art', 'music', 'sports', 'photography', 'wildlife'],
            default: []
        }],
        favoriteDestinations: [{
            name: String,
            country: String,
            description: String,
            visited: Boolean,
            rating: {
                type: Number,
                min: 1,
                max: 5
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
