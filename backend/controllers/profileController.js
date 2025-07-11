const User = require('../models/User');

// Get user profile
async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ profile: user.profile });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
}

// Update profile
async function updateProfile(req, res) {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profile: updates } },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ profile: user.profile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
}

// Update travel preferences
async function updatePreferences(req, res) {
    try {
        const { budget, accommodation, transportation, activities } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'profile.travelPreferences.budget': budget,
                    'profile.travelPreferences.accommodation': accommodation,
                    'profile.travelPreferences.transportation': transportation,
                    'profile.travelPreferences.activities': activities
                }
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ preferences: user.profile.travelPreferences });
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
}

// Update interests
async function updateInterests(req, res) {
    try {
        const interests = req.body.interests;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { 'profile.interests': interests } },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ interests: user.profile.interests });
    } catch (error) {
        res.status(500).json({ message: 'Error updating interests', error: error.message });
    }
}

// Add favorite destination
async function addFavoriteDestination(req, res) {
    try {
        const { name, country, description, visited, rating } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    'profile.favoriteDestinations': {
                        name,
                        country,
                        description,
                        visited,
                        rating
                    }
                }
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ destinations: user.profile.favoriteDestinations });
    } catch (error) {
        res.status(500).json({ message: 'Error adding favorite destination', error: error.message });
    }
}

// Get favorite destinations
async function getFavoriteDestinations(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ destinations: user.profile.favoriteDestinations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorite destinations', error: error.message });
    }
}

// Update favorite destination
async function updateFavoriteDestination(req, res) {
    try {
        const { name, country, description, visited, rating } = req.body;
        const destinationId = req.params.destinationId;
        
        const user = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                'profile.favoriteDestinations._id': destinationId
            },
            {
                $set: {
                    'profile.favoriteDestinations.$': {
                        name,
                        country,
                        description,
                        visited,
                        rating
                    }
                }
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        
        res.json({ destinations: user.profile.favoriteDestinations });
    } catch (error) {
        res.status(500).json({ message: 'Error updating favorite destination', error: error.message });
    }
}

// Remove favorite destination
async function removeFavoriteDestination(req, res) {
    try {
        const destinationId = req.params.destinationId;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $pull: {
                    'profile.favoriteDestinations': {
                        _id: destinationId
                    }
                }
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ destinations: user.profile.favoriteDestinations });
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite destination', error: error.message });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    updatePreferences,
    updateInterests,
    addFavoriteDestination,
    getFavoriteDestinations,
    updateFavoriteDestination,
    removeFavoriteDestination
};
