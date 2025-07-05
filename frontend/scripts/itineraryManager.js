class ItineraryManager {
    constructor() {
        this.currentTripId = null;
        this.currentDate = null;
        this.itineraryContainer = null;
        this.activityForm = null;
        this.activityCategories = [
            'sightseeing',
            'dining',
            'activities',
            'transport',
            'accommodation',
            'other'
        ];
    }

    init(tripId) {
        this.currentTripId = tripId;
        this.itineraryContainer = document.getElementById('itineraryContainer');
        this.activityForm = document.getElementById('activityForm');
        
        this.setupEventListeners();
        this.loadCurrentDate();
        this.loadItinerary();
    }

    setupEventListeners() {
        // Add activity form submission
        this.activityForm?.addEventListener('submit', (e) => this.handleAddActivity(e));
        
        // Date change handler
        document.getElementById('datePicker')?.addEventListener('change', (e) => {
            this.currentDate = new Date(e.target.value);
            this.loadItinerary();
        });
    }

    loadCurrentDate() {
        const today = new Date();
        this.currentDate = today;
        document.getElementById('datePicker').value = today.toISOString().split('T')[0];
    }

    async loadItinerary() {
        if (!this.currentTripId || !this.currentDate) return;

        try {
            const response = await fetch(`/api/itinerary/trip/${this.currentTripId}/${this.currentDate.toISOString().split('T')[0]}`);
            const itinerary = await response.json();
            
            this.renderItinerary(itinerary);
        } catch (error) {
            console.error('Error loading itinerary:', error);
        }
    }

    async handleAddActivity(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const activity = {
            title: formData.get('title'),
            description: formData.get('description'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            location: formData.get('location'),
            category: formData.get('category'),
            notes: formData.get('notes'),
            cost: parseFloat(formData.get('cost')) || 0,
            currency: formData.get('currency') || 'USD'
        };

        try {
            const response = await fetch(`/api/itinerary/trip/${this.currentTripId}/${this.currentDate.toISOString().split('T')[0]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ activities: [activity] })
            });

            if (response.ok) {
                e.target.reset();
                this.loadItinerary();
            }
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    }

    renderItinerary(itinerary) {
        if (!itinerary || !itinerary.activities?.length) {
            this.itineraryContainer.innerHTML = '<p>No activities planned for this day</p>';
            return;
        }

        const activitiesHtml = itinerary.activities.map(activity => `
            <div class="activity-card">
                <div class="activity-header">
                    <span class="activity-time">
                        ${new Date(activity.startTime).toLocaleTimeString()} - ${new Date(activity.endTime).toLocaleTimeString()}
                    </span>
                    <span class="activity-category badge ${activity.category}">${activity.category}</span>
                </div>
                <h3>${activity.title}</h3>
                <p>${activity.description}</p>
                <div class="activity-details">
                    <p><strong>Location:</strong> ${activity.location}</p>
                    <p><strong>Cost:</strong> ${activity.cost} ${activity.currency}</p>
                    ${activity.notes ? `<p><strong>Notes:</strong> ${activity.notes}</p>` : ''}
                </div>
                <button class="btn btn-danger" onclick="deleteActivity('${itinerary._id}', '${activity._id}')">
                    Delete
                </button>
            </div>
        `).join('');

        this.itineraryContainer.innerHTML = `
            <h3>Activities for ${this.currentDate.toLocaleDateString()}</h3>
            <div class="itinerary-content">
                ${activitiesHtml}
                <div class="total-cost">
                    <h4>Total Cost: ${itinerary.totalCost} ${itinerary.currency}</h4>
                </div>
            </div>
        `;
    }
}

// Export the manager
window.ItineraryManager = new ItineraryManager();
