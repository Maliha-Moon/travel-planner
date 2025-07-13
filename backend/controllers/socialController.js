const User = require('../models/User');
const Trip = require('../models/Trip');
const TravelTip = require('../models/TravelTip');

// Trip Sharing
async function shareTrip(req, res) {
    try {
        const { userIds } = req.body;
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        // Validate that user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Add users to sharedWith array
        trip.sharedWith.push(...userIds);
        await trip.save();
        
        res.json({ message: 'Trip shared successfully', trip });
    } catch (error) {
        res.status(500).json({ message: 'Error sharing trip', error: error.message });
    }
}

async function getSharedUsers(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('sharedWith', 'username profilePicture');
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        res.json({ sharedUsers: trip.sharedWith });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shared users', error: error.message });
    }
}

async function unshareTrip(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        // Validate that user owns the trip
        if (trip.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Remove user from sharedWith array
        trip.sharedWith = trip.sharedWith.filter(id => id.toString() !== req.params.userId);
        await trip.save();
        
        res.json({ message: 'Trip unshared successfully', trip });
    } catch (error) {
        res.status(500).json({ message: 'Error unsharing trip', error: error.message });
    }
}

// Trip Reviews
async function addTripReview(req, res) {
    try {
        const { rating, comment } = req.body;
        const trip = await Trip.findById(req.params.tripId);
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        // Check if user has already reviewed
        const existingReview = trip.reviews.find(review => review.userId.toString() === req.user.id);
        if (existingReview) {
            return res.status(400).json({ message: 'User has already reviewed this trip' });
        }
        
        // Add new review
        trip.reviews.push({
            userId: req.user.id,
            rating,
            comment
        });
        
        // Update average rating and review count
        trip.reviewCount = trip.reviews.length;
        trip.averageRating = trip.reviews.reduce((sum, review) => sum + review.rating, 0) / trip.reviewCount;
        
        await trip.save();
        
        res.json({ message: 'Review added successfully', trip });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
}

async function getTripReviews(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('reviews.userId', 'username profilePicture');
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        res.json({ reviews: trip.reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
}

// Travel Tips
async function createTravelTip(req, res) {
    try {
        const tipData = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const tip = new TravelTip({
            ...tipData,
            userId: req.user.id,
            userName: user.username,
            profilePicture: user.profile?.profilePicture || ''
        });
        
        await tip.save();
        res.json({ message: 'Travel tip created successfully', tip });
    } catch (error) {
        res.status(500).json({ message: 'Error creating travel tip', error: error.message });
    }
}

async function getTravelTips(req, res) {
    try {
        const { category, location, sortBy = 'createdAt', page = 1, limit = 10 } = req.query;
        const query = {};
        
        if (category) {
            query.category = category;
        }
        
        if (location) {
            query.location = { $text: { $search: location } };
        }
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: {
                [sortBy]: -1
            },
            populate: [
                { path: 'userId', select: 'username profilePicture' },
                { path: 'comments.userId', select: 'username profilePicture' }
            ]
        };
        
        const tips = await TravelTip.paginate(query, options);
        res.json(tips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching travel tips', error: error.message });
    }
}

async function likeTravelTip(req, res) {
    try {
        const tip = await TravelTip.findById(req.params.tipId);
        
        if (!tip) {
            return res.status(404).json({ message: 'Travel tip not found' });
        }
        
        // Check if user already liked
        const alreadyLiked = tip.likes.some(userId => userId.toString() === req.user.id);
        if (alreadyLiked) {
            return res.status(400).json({ message: 'User has already liked this tip' });
        }
        
        // Add like
        tip.likes.push(req.user.id);
        tip.likeCount = tip.likes.length;
        await tip.save();
        
        res.json({ message: 'Tip liked successfully', tip });
    } catch (error) {
        res.status(500).json({ message: 'Error liking tip', error: error.message });
    }
}

async function addComment(req, res) {
    try {
        const { content } = req.body;
        const tip = await TravelTip.findById(req.params.tipId);
        const user = await User.findById(req.user.id);
        
        if (!tip) {
            return res.status(404).json({ message: 'Travel tip not found' });
        }
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        tip.comments.push({
            userId: req.user.id,
            userName: user.username,
            content
        });
        
        tip.commentCount = tip.comments.length;
        await tip.save();
        
        res.json({ message: 'Comment added successfully', tip });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
}

// Search
async function searchTravelTips(req, res) {
    try {
        const { query, category, location } = req.query;
        const searchQuery = {};
        
        if (query) {
            searchQuery.$text = { $search: query };
        }
        
        if (category) {
            searchQuery.category = category;
        }
        
        if (location) {
            searchQuery.location = { $text: { $search: location } };
        }
        
        const tips = await TravelTip.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate('userId', 'username profilePicture');
        
        res.json({ tips });
    } catch (error) {
        res.status(500).json({ message: 'Error searching travel tips', error: error.message });
    }
}

async function searchUsers(req, res) {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { 'profile.firstName': { $regex: query, $options: 'i' } },
                { 'profile.lastName': { $regex: query, $options: 'i' } }
            ]
        }).select('username profile');
        
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
}

module.exports = {
    shareTrip,
    getSharedUsers,
    unshareTrip,
    addTripReview,
    getTripReviews,
    createTravelTip,
    getTravelTips,
    likeTravelTip,
    addComment,
    searchTravelTips,
    searchUsers
};
