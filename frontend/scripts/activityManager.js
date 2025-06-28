class ActivityManager {
    constructor() {
        this.baseUrl = '/api/trips';
    }

    async getActivities(tripId) {
        try {
            const response = await fetch(`${this.baseUrl}/${tripId}/activities`);
            if (!response.ok) throw new Error('Failed to fetch activities');
            return await response.json();
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    async addActivity(tripId, destinationId, activityData) {
        try {
            const response = await fetch(`${this.baseUrl}/${tripId}/destinations/${destinationId}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
            if (!response.ok) throw new Error('Failed to add activity');
            return await response.json();
        } catch (error) {
            console.error('Error adding activity:', error);
            throw error;
        }
    }

    async updateActivity(tripId, destinationId, activityId, activityData) {
        try {
            const response = await fetch(`${this.baseUrl}/${tripId}/destinations/${destinationId}/activities/${activityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
            if (!response.ok) throw new Error('Failed to update activity');
            return await response.json();
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    }

    async deleteActivity(tripId, destinationId, activityId) {
        try {
            const response = await fetch(`${this.baseUrl}/${tripId}/destinations/${destinationId}/activities/${activityId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete activity');
            return await response.json();
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    }

    renderActivityList(container, activities) {
        container.innerHTML = '';
        activities.forEach(activity => {
            const activityCard = this.createActivityCard(activity);
            container.appendChild(activityCard);
        });
    }

    createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        card.innerHTML = `
            <div class="activity-header">
                <h3>${activity.name}</h3>
                <div class="activity-actions">
                    <button class="btn btn-edit" onclick="activityManager.editActivity('${activity._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="activityManager.deleteActivity('${activity._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="activity-details">
                <p><strong>Category:</strong> ${activity.category}</p>
                <p><strong>Location:</strong> ${activity.location}</p>
                <p><strong>Time:</strong> ${new Date(activity.startTime).toLocaleString()} - ${new Date(activity.endTime).toLocaleString()}</p>
                <p><strong>Cost:</strong> $${activity.cost}</p>
            </div>
        `;

        return card;
    }

    async editActivity(activityId) {
        // Implement edit functionality
    }

    async deleteActivity(activityId) {
        // Implement delete functionality
    }
}

// Initialize activity manager
const activityManager = new ActivityManager();
