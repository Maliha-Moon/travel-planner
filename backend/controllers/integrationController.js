const axios = require('axios');
const Trip = require('../models/Trip');
const config = require('../config/config');

// Flight Integration
async function searchFlights(req, res) {
    try {
        const { origin, destination, departureDate, returnDate, passengers, cabinClass } = req.body;
        
        // Format dates for API
        const departure = new Date(departureDate).toISOString().split('T')[0];
        const returnDateFormatted = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

        // Make request to flight API
        const response = await axios.get(`${config.FLIGHT_API_BASE_URL}/search`, {
            params: {
                apikey: config.FLIGHT_API_KEY,
                origin: origin,
                destination: destination,
                departure: departure,
                return: returnDateFormatted,
                adults: passengers.adults,
                children: passengers.children || 0,
                infants: passengers.infants || 0,
                cabinClass: cabinClass || 'economy',
                currency: req.body.currency || 'USD'
            }
        });

        // Format response
        const flights = response.data.map(flight => ({
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            departure: {
                airport: flight.departure.airport,
                time: new Date(flight.departure.time)
            },
            arrival: {
                airport: flight.arrival.airport,
                time: new Date(flight.arrival.time)
            },
            duration: flight.duration,
            price: {
                amount: flight.price.amount,
                currency: flight.price.currency
            },
            stops: flight.stops,
            bookingLink: flight.bookingLink,
            rating: flight.rating
        }));

        res.json({ flights });
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({ message: 'Error searching flights', error: error.message });
    }
}

// Hotel Integration
async function searchHotels(req, res) {
    try {
        const { destination, checkIn, checkOut, guests, rooms, amenities, priceRange, rating } = req.body;

        // Format dates for API
        const checkInDate = new Date(checkIn).toISOString().split('T')[0];
        const checkOutDate = new Date(checkOut).toISOString().split('T')[0];

        // Make request to hotel API
        const response = await axios.get(`${config.HOTEL_API_BASE_URL}/search`, {
            params: {
                apikey: config.HOTEL_API_KEY,
                destination: destination,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: guests,
                rooms: rooms,
                amenities: amenities.join(','),
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                minRating: rating.min,
                maxRating: rating.max,
                currency: req.body.currency || 'USD'
            }
        });

        // Format response
        const hotels = response.data.map(hotel => ({
            name: hotel.name,
            address: hotel.address,
            rating: hotel.rating,
            price: {
                amount: hotel.price.amount,
                currency: hotel.price.currency
            },
            amenities: hotel.amenities,
            distanceToCenter: hotel.distanceToCenter,
            photos: hotel.photos,
            bookingLink: hotel.bookingLink,
            availableRooms: hotel.availableRooms
        }));

        res.json({ hotels });
    } catch (error) {
        console.error('Error searching hotels:', error);
        res.status(500).json({ message: 'Error searching hotels', error: error.message });
    }
}

// Insurance Integration
async function getInsuranceRecommendations(req, res) {
    try {
        const { tripId } = req.body;
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Analyze trip details to recommend insurance
        const recommendations = [];

        // Medical coverage recommendation
        recommendations.push({
            provider: 'GlobalTravelInsure',
            coverageType: 'medical',
            coverageAmount: 500000,
            price: {
                amount: 150,
                currency: 'USD'
            },
            features: ['24/7 emergency medical', 'repatriation', 'medical evacuation'],
            rating: 4.8,
            coverageDetails: {
                medical: 500000,
                tripCancellation: 0,
                baggage: 0,
                emergencyEvacuation: 50000,
                sportsCoverage: false,
                adventureActivities: false
            },
            bookingLink: 'https://globaltravelinsure.com/medical'
        });

        // Trip cancellation recommendation
        recommendations.push({
            provider: 'TripSaver',
            coverageType: 'trip_cancellation',
            coverageAmount: trip.budget.totalBudget,
            price: {
                amount: 100,
                currency: 'USD'
            },
            features: ['trip cancellation', 'trip interruption', 'baggage loss'],
            rating: 4.6,
            coverageDetails: {
                medical: 0,
                tripCancellation: 1000000,
                baggage: 2000,
                emergencyEvacuation: 0,
                sportsCoverage: true,
                adventureActivities: true
            },
            bookingLink: 'https://tripsaver.com/cancellation'
        });

        // Comprehensive coverage recommendation
        recommendations.push({
            provider: 'WorldWideProtect',
            coverageType: 'comprehensive',
            coverageAmount: 1000000,
            price: {
                amount: 250,
                currency: 'USD'
            },
            features: ['all-inclusive coverage', '24/7 support', 'emergency evacuation'],
            rating: 4.9,
            coverageDetails: {
                medical: 500000,
                tripCancellation: 1000000,
                baggage: 5000,
                emergencyEvacuation: 50000,
                sportsCoverage: true,
                adventureActivities: true
            },
            bookingLink: 'https://worldwideprotect.com/comprehensive'
        });

        res.json({ recommendations });
    } catch (error) {
        console.error('Error getting insurance recommendations:', error);
        res.status(500).json({ message: 'Error getting insurance recommendations', error: error.message });
    }
}

module.exports = {
    searchFlights,
    searchHotels,
    getInsuranceRecommendations
};
