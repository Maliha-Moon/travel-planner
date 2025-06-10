// Trip Planner UI Module
const tripPlannerUI = (function() {
    const tripManager = window.tripManager;
    
    // DOM Elements
    const tripForm = document.getElementById('tripForm');
    const tripList = document.getElementById('tripList');
    const tripDetailsModal = document.getElementById('tripDetailsModal');
    const closeBtn = document.querySelector('.close');
    const destinationForm = document.getElementById('destinationForm');
    const activityForm = document.getElementById('activityForm');

    // Event Listeners
    tripForm.addEventListener('submit', handleTripFormSubmit);
    destinationForm.addEventListener('submit', handleDestinationFormSubmit);
    activityForm.addEventListener('submit', handleActivityFormSubmit);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === tripDetailsModal) {
            closeModal();
        }
    });

    // Initialize
    function init() {
        loadTrips();
    }

    // Load all trips
    async function loadTrips() {
        try {
            const trips = await tripManager.getTrips();
            displayTrips(trips);
        } catch (error) {
            console.error('Error loading trips:', error);
        }
    }

    // Display trips in the list
    function displayTrips(trips) {
        tripList.innerHTML = '';
        trips.forEach(trip => {
            const tripCard = createTripCard(trip);
            tripList.appendChild(tripCard);
        });
    }

    // Create trip card element
    function createTripCard(trip) {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.innerHTML = `
            <h3>${trip.title}</h3>
            <div class="trip-info">
                <div>
                    <p><strong>Status:</strong> ${trip.status}</p>
                    <p><strong>Duration:</strong> ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</p>
                </div>
                <div class="trip-cost">
                    <p>Total Cost: $${trip.totalCost.toFixed(2)}</p>
                </div>
            </div>
            <div class="trip-actions">
                <button class="btn-edit" onclick="editTrip('${trip._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteTrip('${trip._id}')">Delete</button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-edit') && !e.target.closest('.btn-delete')) {
                showTripDetails(trip);
            }
        });
        return card;
    }

    // Show trip details modal
    async function showTripDetails(trip) {
        document.getElementById('tripTitleModal').textContent = trip.title;
        
        // Load and display destinations
        const destinations = trip.destinations || [];
        const tripDetails = document.getElementById('tripDetails');
        tripDetails.innerHTML = '';
        
        destinations.forEach(destination => {
            const destinationElement = createDestinationElement(destination);
            tripDetails.appendChild(destinationElement);
        });

        // Update cost display
        const tripCostElement = document.getElementById('tripCost');
        tripCostElement.innerHTML = `
            <h4>Total Trip Cost: $${trip.totalCost.toFixed(2)}</h4>
        `;

        // Store trip ID for forms
        destinationForm.dataset.tripId = trip._id;
        activityForm.dataset.tripId = trip._id;

        // Show modal
        tripDetailsModal.style.display = 'block';
    }

    // Create destination element
    function createDestinationElement(destination) {
        const element = document.createElement('div');
        element.className = 'destination-card';
        element.innerHTML = `
            <h4>${destination.name}</h4>
            <p><strong>Duration:</strong> ${new Date(destination.arrivalDate).toLocaleDateString()} - ${new Date(destination.departureDate).toLocaleDateString()}</p>
            <div class="destination-cost">
                <p>Total Cost: $${destination.totalCost.toFixed(2)}</p>
            </div>
        `;
        return element;
    }

    // Handle trip form submission
    async function handleTripFormSubmit(e) {
        e.preventDefault();
        const formData = {
            title: document.getElementById('tripTitle').value,
            description: document.getElementById('tripDescription').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            status: 'planning'
        };

        try {
            await tripManager.createTrip(formData);
            tripForm.reset();
            loadTrips();
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    }

    // Handle destination form submission
    async function handleDestinationFormSubmit(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('destinationName').value,
            arrivalDate: document.getElementById('arrivalDate').value,
            departureDate: document.getElementById('departureDate').value,
            activities: []
        };

        try {
            await tripManager.updateTrip(destinationForm.dataset.tripId, { 
                $push: { destinations: formData }
            });
            destinationForm.reset();
            loadTrips();
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    }

    // Handle activity form submission
    async function handleActivityFormSubmit(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('activityName').value,
            category: document.getElementById('activityCategory').value,
            cost: parseFloat(document.getElementById('activityCost').value) || 0
        };

        try {
            // Find the last destination in the trip
            const trip = await tripManager.getTrip(activityForm.dataset.tripId);
            const lastDestination = trip.destinations[trip.destinations.length - 1];
            
            await tripManager.updateTrip(activityForm.dataset.tripId, { 
                $push: { 
                    'destinations.$[destination].activities': formData 
                },
                arrayFilters: [{ 'destination._id': lastDestination._id }]
            });
            
            activityForm.reset();
            loadTrips();
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    }

    // Close modal
    function closeModal() {
        tripDetailsModal.style.display = 'none';
    }

    // Edit trip
    async function editTrip(tripId) {
        try {
            const trip = await tripManager.getTrip(tripId);
            // Show edit modal or navigate to edit page
            console.log('Edit trip:', trip);
        } catch (error) {
            console.error('Error editing trip:', error);
        }
    }

    // Delete trip
    async function deleteTrip(tripId) {
        if (!confirm('Are you sure you want to delete this trip?')) {
            return;
        }

        try {
            await tripManager.deleteTrip(tripId);
            loadTrips();
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    }

    return {
        init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    tripPlannerUI.init();
});
