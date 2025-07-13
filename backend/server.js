const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('./middleware/fileUpload');

// Load environment variables
dotenv.config({ path: '../config/.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload); // File upload middleware

// Weather service
const weatherService = require('./services/weatherService');

// Routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

// Weather routes
app.get('/api/weather/:location', async (req, res) => {
    try {
        const weatherData = await weatherService.getWeatherData(req.params.location);
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching weather data',
            error: error.message
        });
    }
});

// Currency routes
app.get('/api/currency/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.query;
        if (!amount || !from || !to) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const convertedAmount = await currencyService.convertCurrency(
            parseFloat(amount),
            from.toUpperCase(),
            to.toUpperCase()
        );

        res.json({
            amount: convertedAmount,
            from: from.toUpperCase(),
            to: to.toUpperCase()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error converting currency',
            error: error.message
        });
    }
});

app.get('/api/currency/rate', async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const rate = await currencyService.getExchangeRate(
            from.toUpperCase(),
            to.toUpperCase()
        );

        res.json({
            rate,
            from: from.toUpperCase(),
            to: to.toUpperCase()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error getting exchange rate',
            error: error.message
        });
    }
});

// File upload route
app.post('/api/files/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.files.file;
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        // Create uploads directory if it doesn't exist
        const path = require('path');
        const fs = require('fs');
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Generate unique filename
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadPath, fileName);

        // Move uploaded file
        await file.mv(filePath);

        res.json({
            message: 'File uploaded successfully',
            file: {
                name: fileName,
                size: file.size,
                type: file.mimetype,
                url: `/uploads/${fileName}`
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const activityRoutes = require('./routes/activityRoutes');
const profileRoutes = require('./routes/profileRoutes');
const socialRoutes = require('./routes/socialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/trips/activities', activityRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
