const express = require('express');
const cors = require('cors'); // Import CORS
const { connectToDB, sql } = require('../db_config');
const { verifyUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Enable CORS for this router
router.use(cors());

// Add a booking
router.post('/book', verifyUser, async (req, res) => {
    const { checkin, checkout, rooms, adults, children, hotel_id } = req.body;

    // Validate input
    if (!checkin || !checkout || rooms < 1 || adults < 1 || !hotel_id) {
        return res.status(400).send('Invalid booking details');
    }

    try {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const daysStay = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);

        if (daysStay <= 0) {
            return res.status(400).send('Check-out date must be after check-in date');
        }

        const pool = await connectToDB();
        const hotelResult = await pool.request()
            .input('HotelID', sql.Int, hotel_id)
            .query('SELECT room_price_per_day, child_charge_per_day FROM Hotels WHERE id = @HotelID');

        if (hotelResult.recordset.length === 0) {
            return res.status(404).send('Hotel not found');
        }

        const hotel = hotelResult.recordset[0];
        const basePrice = rooms * hotel.room_price_per_day * daysStay;
        const extraChildCharges = (children || 0) * hotel.child_charge_per_day * daysStay;
        const totalPrice = basePrice + extraChildCharges;

        const { user_id } = req.user;

        const result = await pool.request()
            .input('Checkin', sql.Date, checkin)
            .input('Checkout', sql.Date, checkout)
            .input('Rooms', sql.Int, rooms)
            .input('Adults', sql.Int, adults)
            .input('Children', sql.Int, children || 0)
            .input('UserId', sql.Int, user_id)
            .input('HotelId', sql.Int, hotel_id)
            .input('TotalPrice', sql.Decimal(18, 2), totalPrice)
            .query(`
                INSERT INTO Bookings (checkin_date, checkout_date, rooms, adults, children, UserID, hotel_Id, total_price) 
                OUTPUT Inserted.booking_id 
                VALUES (@Checkin, @Checkout, @Rooms, @Adults, @Children, @UserId, @HotelId, @TotalPrice)
            `);

        const bookingId = result.recordset[0].booking_id;
        res.send(`Booking confirmed! Your booking ID is ${bookingId}. Total price: ${totalPrice} TK`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving booking');
    }
});

module.exports = router;
