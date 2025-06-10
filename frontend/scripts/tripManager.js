// Trip Manager Module
const tripManager = (function() {
    const TRIP_URL = `${API_CONFIG.BASE_URL}/trips`;
    
    // Create a new trip
    async function createTrip(tripData) {
        try {
            const response = await fetch(TRIP_URL, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(tripData)
            });
            
            const data = await handleApiResponse(response);
            return data;
        } catch (error) {
            handleApiError(error, 'Failed to create trip');
            throw error;
        }
    }

    // Get all trips for the current user
    async function getTrips() {
        try {
            const response = await fetch(TRIP_URL, {
                headers: getAuthHeader()
            });
            
            const data = await handleApiResponse(response);
            return data.trips || [];
        } catch (error) {
            handleApiError(error, 'Failed to fetch trips');
            throw error;
        }
    }

    // Get a specific trip
    async function getTrip(tripId) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}`, {
                headers: getAuthHeader()
            });
            
            const data = await handleApiResponse(response);
            return data.trip;
        } catch (error) {
            handleApiError(error, 'Failed to fetch trip details');
            throw error;
        }
    }

    // Update a trip
    async function updateTrip(tripId, tripData) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(tripData)
            });
            
            const data = await handleApiResponse(response);
            return data.trip;
        } catch (error) {
            handleApiError(error, 'Failed to update trip');
            throw error;
        }
    }

    // Delete a trip
    async function deleteTrip(tripId) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            
            const data = await handleApiResponse(response);
            return data;
        } catch (error) {
            handleApiError(error, 'Failed to delete trip');
            throw error;
        }
    }

    // Share a trip with other users
    async function shareTrip(tripId, userIds) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}/share`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ userIds })
            });
            
            const data = await handleApiResponse(response);
            return data;
        } catch (error) {
            handleApiError(error, 'Failed to share trip');
            throw error;
        }
    }

    // Calculate total cost for a trip
    function calculateTripCost(trip) {
        let totalCost = 0;
        trip.destinations?.forEach(destination => {
            destination.activities?.forEach(activity => {
                totalCost += activity.cost || 0;
            });
        });
        return totalCost;
    }

    // Update trip status
    async function updateTripStatus(tripId, status) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status })
            });
            
            const data = await handleApiResponse(response);
            return data.trip;
        } catch (error) {
            handleApiError(error, 'Failed to update trip status');
            throw error;
        }
    }

    return {
        createTrip,
        getTrips,
        getTrip,
        updateTrip,
        deleteTrip,
        shareTrip,
        calculateTripCost,
        updateTripStatus
    };
})();

// Export for testing
export default tripManager;
