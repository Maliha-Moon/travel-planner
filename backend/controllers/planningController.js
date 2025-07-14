const Trip = require('../models/Trip');
const User = require('../models/User');

// Budget Management
async function getBudgetUsage(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('userId', 'budgetPreferences')
            .select('budget');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Calculate budget usage
        const budgetUsage = trip.calculateBudgetUsage();
        
        res.json({
            budget: trip.budget,
            usage: budgetUsage
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budget usage', error: error.message });
    }
}

async function updateBudget(req, res) {
    try {
        const { categories, expenses, totalBudget, currency, exchangeRate } = req.body;
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Update budget categories
        trip.budget.categories = categories;
        trip.budget.expenses = expenses;
        trip.budget.totalBudget = totalBudget;
        trip.budget.currency = currency;
        trip.budget.exchangeRate = exchangeRate;

        await trip.save();
        res.json({ message: 'Budget updated successfully', budget: trip.budget });
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
}

// Packing List Management
async function generatePackingList(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('userId', 'travelPreferences');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Generate packing list based on trip details and user preferences
        const packingList = trip.generatePackingList();
        
        // Add weather-based items
        // This would typically integrate with weather API
        const weatherItems = await getWeatherBasedItems(trip.destinations);
        packingList.weatherBasedItems = weatherItems;

        res.json({ packingList });
    } catch (error) {
        res.status(500).json({ message: 'Error generating packing list', error: error.message });
    }
}

async function updatePackingList(req, res) {
    try {
        const { items, categories, checklist } = req.body;
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Update packing list
        trip.packingList.items = items;
        trip.packingList.categories = categories;
        trip.packingList.checklist = checklist;

        await trip.save();
        res.json({ message: 'Packing list updated successfully', packingList: trip.packingList });
    } catch (error) {
        res.status(500).json({ message: 'Error updating packing list', error: error.message });
    }
}

// Travel Checklist Management
async function getChecklist(req, res) {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('userId', 'travelPreferences');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Generate travel checklist
        const checklist = trip.generateChecklist();
        
        res.json({ checklist });
    } catch (error) {
        res.status(500).json({ message: 'Error generating checklist', error: error.message });
    }
}

async function updateChecklist(req, res) {
    try {
        const { items, categories, progress, reminders } = req.body;
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Update checklist
        trip.travelChecklist.items = items;
        trip.travelChecklist.categories = categories;
        trip.travelChecklist.progress = progress;
        trip.travelChecklist.reminders = reminders;

        // Update progress percentage
        const totalItems = items.length;
        const completedItems = items.filter(item => item.completed).length;
        trip.travelChecklist.progress = {
            completed: completedItems,
            total: totalItems,
            percentage: (completedItems / totalItems) * 100 || 0
        };

        await trip.save();
        res.json({ message: 'Checklist updated successfully', checklist: trip.travelChecklist });
    } catch (error) {
        res.status(500).json({ message: 'Error updating checklist', error: error.message });
    }
}

// Helper functions
async function getWeatherBasedItems(destinations) {
    // This would typically integrate with a weather API
    // For now, we'll return some sample weather-based items
    return destinations.map(dest => ({
        destination: dest.name,
        items: [
            'Umbrella',
            'Raincoat',
            'Sunscreen',
            'Sunglasses',
            'Warm clothing'
        ]
    }));
}

module.exports = {
    getBudgetUsage,
    updateBudget,
    generatePackingList,
    updatePackingList,
    getChecklist,
    updateChecklist
};
