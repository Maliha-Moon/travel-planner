// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const jwt = require('jsonwebtoken'); // Import JWT
// // const session = require('express-session');
// const { connectToDB } = require('./db_config');
// const sql = require('mssql');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors()); // Enable CORS for all routes


// app.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//         return res.status(400).send('Invalid email format.');
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const pool = await connectToDB();

//         const result = await pool.request()
//             .input('Username', sql.VarChar, username)
//             .input('Email', sql.VarChar, email)
//             .input('Password', sql.VarChar, hashedPassword)
//             .query('INSERT INTO Users (Username, Email, Password) VALUES (@Username, @Email, @Password)');

//         res.status(201).json({ message: 'User registered successfully!' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Error registering user.' });
//     }
// });

// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const pool = await connectToDB();
//         const result = await pool.request()
//             .input('Username', sql.VarChar, username)
//             .query('SELECT * FROM Users WHERE Username = @Username');

//         if (result.recordset.length > 0) {
//             const user = result.recordset[0];
//             const isPasswordValid = await bcrypt.compare(password, user.Password);

//             if (isPasswordValid) {
//                 const token = jwt.sign(
//                     { id: user.UserId, username: user.Username }, // Payload (user info)
//                     process.env.JWT_SECRET, // Secret key from env file
//                     { expiresIn: '1h' } // Optional expiration time
//                 );

//                 // Send the token back to the client
//                 res.status(200).json({
//                     message: 'Login successful!',
//                     token: token // The token is sent to the client
//                 });
//             }
//             else {
//                 res.status(401).json({ error: 'Invalid credentials.' });
//             }
//         } else {
//             res.status(404).json({ error: 'User not found.' });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Error logging in.' });
//     }
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// const cors = require('cors');
// app.use(cors());  // This enables CORS for all routes


const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connectToDB } = require('./db_config');
const sql = require('mssql');

const app = express();
const port = 5500;

//app.use(express.static(pa))
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cors());

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await connectToDB();

        await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Email', sql.VarChar, email)
            .input('Password', sql.VarChar, hashedPassword)
            .query('INSERT INTO Users (Username, Email, Password) VALUES (@Username, @Email, @Password)');

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user.' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectToDB();
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const isPasswordValid = await bcrypt.compare(password, user.Password);

            if (isPasswordValid) {
                const token = jwt.sign(
                    { id: user.UserId, username: user.Username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                res.status(200).json({ message: 'Login successful!', token });
            } else {
                res.status(401).json({ error: 'Invalid credentials.' });
            }
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in.' });
    }
});

// Ticket Booking Endpoint
app.post('/server_endpoint_for_ticket_booking', async (req, res) => {
    const { destination, departure_date, passenger_count } = req.body;

    if (!destination || !departure_date || !passenger_count) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const pool = await connectToDB();

        await pool.request()
            .input('Destination', sql.VarChar, destination)
            .input('DepartureDate', sql.Date, departure_date)
            .input('PassengerCount', sql.Int, passenger_count)
            .query('INSERT INTO tickets (destination, departure_date, passenger_count) VALUES (@Destination, @DepartureDate, @PassengerCount)');

        res.status(201).json({ message: 'Ticket booking successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error booking ticket.' });
    }
});

// Car Rental Endpoint
app.post('/server_endpoint_for_car_rental', async (req, res) => {
    const { pickup_location, pickup_date, dropoff_date } = req.body;

    if (!pickup_location || !pickup_date || !dropoff_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const pool = await connectToDB();

        await pool.request()
            .input('PickupLocation', sql.VarChar, pickup_location)
            .input('PickupDate', sql.Date, pickup_date)
            .input('DropoffDate', sql.Date, dropoff_date)
            .query('INSERT INTO car_rentals (pickup_location, pickup_date, dropoff_date) VALUES (@PickupLocation, @PickupDate, @DropoffDate)');

        res.status(201).json({ message: 'Car rental booking successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error booking car rental.' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
