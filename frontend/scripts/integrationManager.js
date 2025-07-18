// Integration Manager Module
const integrationManager = (function() {
    const INTEGRATION_URL = `${API_CONFIG.BASE_URL}/integrations`;

    // Initialize integrations page
    async function initialize() {
        try {
            // Load current trip if available
            const urlParams = new URLSearchParams(window.location.search);
            const tripId = urlParams.get('tripId');
            
            if (tripId) {
                await loadTripDetails(tripId);
            }

            // Setup event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing integrations:', error);
            showError('Failed to initialize integrations');
        }
    }

    // Flight Search
    async function searchFlights() {
        try {
            const formData = {
                origin: document.getElementById('origin').value,
                destination: document.getElementById('destination').value,
                departureDate: document.getElementById('departure').value,
                returnDate: document.getElementById('return').value,
                passengers: {
                    adults: parseInt(document.getElementById('adults').value),
                    children: parseInt(document.getElementById('children').value),
                    infants: parseInt(document.getElementById('infants').value)
                },
                cabinClass: document.getElementById('cabinClass').value,
                currency: 'USD'
            };

            const response = await fetch(`${INTEGRATION_URL}/flights/search`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            displayFlightResults(data.flights);
        } catch (error) {
            handleApiError(error, 'Failed to search flights');
        }
    }

    function displayFlightResults(flights) {
        const flightResults = document.getElementById('flightResults');
        if (!flightResults) return;

        flightResults.innerHTML = flights.map(flight => `
            <div class="flight-card">
                <div class="flight-info">
                    <h3>${flight.airline} ${flight.flightNumber}</h3>
                    <div class="flight-details">
                        <div class="departure">
                            <span>From</span>
                            <span>${flight.departure.airport}</span>
                            <span>${formatTime(flight.departure.time)}</span>
                        </div>
                        <div class="arrival">
                            <span>To</span>
                            <span>${flight.arrival.airport}</span>
                            <span>${formatTime(flight.arrival.time)}</span>
                        </div>
                    </div>
                    <div class="flight-duration">
                        Duration: ${flight.duration}
                    </div>
                    <div class="flight-price">
                        ${flight.price.currency} ${formatNumber(flight.price.amount)}
                    </div>
                    <div class="flight-stops">
                        Stops: ${flight.stops}
                    </div>
                    <div class="flight-rating">
                        Rating: ${flight.rating}★
                    </div>
                    <a href="${flight.bookingLink}" target="_blank" class="btn-primary">Book Now</a>
                </div>
            </div>
        `).join('');
    }

    // Hotel Search
    async function searchHotels() {
        try {
            const formData = {
                destination: document.getElementById('hotelDestination').value,
                checkIn: document.getElementById('hotelCheckIn').value,
                checkOut: document.getElementById('hotelCheckOut').value,
                guests: parseInt(document.getElementById('hotelGuests').value),
                rooms: parseInt(document.getElementById('hotelRooms').value),
                amenities: Array.from(document.querySelectorAll('.amenities-checkboxes input:checked'))
                    .map(checkbox => checkbox.value),
                priceRange: {
                    min: parseInt(document.getElementById('hotelMinPrice').value),
                    max: parseInt(document.getElementById('hotelMaxPrice').value)
                },
                rating: {
                    min: parseInt(document.getElementById('hotelMinRating').value),
                    max: parseInt(document.getElementById('hotelMaxRating').value)
                },
                currency: 'USD'
            };

            const response = await fetch(`${INTEGRATION_URL}/hotels/search`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            displayHotelResults(data.hotels);
        } catch (error) {
            handleApiError(error, 'Failed to search hotels');
        }
    }

    function displayHotelResults(hotels) {
        const hotelResults = document.getElementById('hotelResults');
        if (!hotelResults) return;

        hotelResults.innerHTML = hotels.map(hotel => `
            <div class="hotel-card">
                <div class="hotel-info">
                    <h3>${hotel.name}</h3>
                    <div class="hotel-address">
                        ${hotel.address}
                    </div>
                    <div class="hotel-rating">
                        Rating: ${hotel.rating}★
                    </div>
                    <div class="hotel-price">
                        ${hotel.price.currency} ${formatNumber(hotel.price.amount)} per night
                    </div>
                    <div class="hotel-amenities">
                        ${hotel.amenities.map(amenity => `<span>${amenity}</span>`).join('')}
                    </div>
                    <div class="hotel-distance">
                        ${hotel.distanceToCenter.toFixed(1)} km from city center
                    </div>
                    <div class="hotel-rooms">
                        Available rooms: ${hotel.availableRooms}
                    </div>
                    <a href="${hotel.bookingLink}" target="_blank" class="btn-primary">Book Now</a>
                </div>
            </div>
        `).join('');
    }

    // Insurance Recommendations
    async function getInsuranceRecommendations() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const tripId = urlParams.get('tripId');

            if (!tripId) {
                throw new Error('No trip ID provided');
            }

            const formData = {
                tripId: tripId
            };

            const response = await fetch(`${INTEGRATION_URL}/insurance/recommendations`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            displayInsuranceRecommendations(data.recommendations);
        } catch (error) {
            handleApiError(error, 'Failed to get insurance recommendations');
        }
    }

    function displayInsuranceRecommendations(recommendations) {
        const insuranceResults = document.getElementById('insuranceResults');
        if (!insuranceResults) return;

        insuranceResults.innerHTML = recommendations.map(insurance => `
            <div class="insurance-card">
                <div class="insurance-info">
                    <h3>${insurance.provider}</h3>
                    <div class="coverage-type">
                        ${insurance.coverageType.charAt(0).toUpperCase() + insurance.coverageType.slice(1)}
                    </div>
                    <div class="coverage-amount">
                        Coverage: ${insurance.currency} ${formatNumber(insurance.coverageAmount)}
                    </div>
                    <div class="price">
                        Price: ${insurance.price.currency} ${formatNumber(insurance.price.amount)}
                    </div>
                    <div class="rating">
                        Rating: ${insurance.rating}★
                    </div>
                    <div class="features">
                        ${insurance.features.map(feature => `<span>${feature}</span>`).join('')}
                    </div>
                    <div class="coverage-details">
                        <div>Medical: ${formatNumber(insurance.coverageDetails.medical)}</div>
                        <div>Trip Cancellation: ${formatNumber(insurance.coverageDetails.tripCancellation)}</div>
                        <div>Baggage: ${formatNumber(insurance.coverageDetails.baggage)}</div>
                        <div>Emergency Evacuation: ${formatNumber(insurance.coverageDetails.emergencyEvacuation)}</div>
                    </div>
                    <a href="${insurance.bookingLink}" target="_blank" class="btn-primary">Get Coverage</a>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Flight search
        document.getElementById('flightSearchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            searchFlights();
        });

        // Hotel search
        document.getElementById('hotelSearchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            searchHotels();
        });

        // Insurance recommendations
        document.getElementById('coverageType').addEventListener('change', getInsuranceRecommendations);
        document.getElementById('priceRange').addEventListener('change', getInsuranceRecommendations);
    }

    // Helper functions
    function formatTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return {
        initialize
    };
})();

// Initialize integrations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    integrationManager.initialize();
});
