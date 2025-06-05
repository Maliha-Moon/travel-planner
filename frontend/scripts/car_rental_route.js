// const express = require('express');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON
// app.use(express.json());

// // Endpoint for ticket booking
// app.post('/server_endpoint_for_ticket_booking', (req, res) => {
//     const { destination, departure_date, passenger_count } = req.body;
    
//     // Validate that all required fields are present
//     if (!destination || !departure_date || !passenger_count) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Insert the data into the database or handle it as needed
//     console.log('Ticket Data:', req.body);

//     // Send a success response
//     res.status(200).json({ success: true });
// });

// // Endpoint for car rental
// app.post('/server_endpoint_for_car_rental', (req, res) => {
//     const { pickup_location, pickup_date, dropoff_date } = req.body;
    
//     // Validate that all required fields are present
//     if (!pickup_location || !pickup_date || !dropoff_date) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Insert the data into the database or handle it as needed
//     console.log('Car Rental Data:', req.body);

//     // Send a success response
//     res.status(200).json({ success: true });
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });


const express = require('express');
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = 3000;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5500', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON
app.use(express.json());

// Endpoint for ticket booking
app.post('/server_endpoint_for_ticket_booking', (req, res) => {
    const { destination, departure_date, passenger_count } = req.body;

    // Validate that all required fields are present
    if (!destination || !departure_date || !passenger_count) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert the data into the database or handle it as needed
    console.log('Ticket Data:', req.body);

    // Send a success response
    res.status(200).json({ success: true });
});

// Endpoint for car rental
app.post('/server_endpoint_for_car_rental', (req, res) => {
    const { pickup_location, pickup_date, dropoff_date } = req.body;

    // Validate that all required fields are present
    if (!pickup_location || !pickup_date || !dropoff_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert the data into the database or handle it as needed
    console.log('Car Rental Data:', req.body);

    // Send a success response
    res.status(200).json({ success: true });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
