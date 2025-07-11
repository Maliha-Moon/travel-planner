// Profile Manager Module
const profileManager = (function() {
    const PROFILE_URL = `${API_CONFIG.BASE_URL}/profile`;

    // Initialize profile page
    async function initialize() {
        try {
            const profile = await getProfile();
            updateProfileUI(profile);
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing profile:', error);
            showError('Failed to load profile');
        }
    }

    // Get user profile
    async function getProfile() {
        try {
            const response = await fetch(PROFILE_URL, {
                headers: getAuthHeader()
            });
            const data = await handleApiResponse(response);
            return data.profile;
        } catch (error) {
            handleApiError(error, 'Failed to fetch profile');
            throw error;
        }
    }

    // Update profile UI
    function updateProfileUI(profile) {
        // Update profile picture
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture) {
            profilePicture.src = profile.profilePicture || '../assets/default-profile.jpg';
        }

        // Update basic info
        document.getElementById('fullName').textContent = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        document.getElementById('bio').textContent = profile.bio || 'No bio yet';

        // Update stats
        document.getElementById('tripsCount').textContent = profile.tripsCount || 0;
        document.getElementById('destinationsCount').textContent = profile.favoriteDestinations?.length || 0;

        // Update preferences
        if (profile.travelPreferences) {
            document.getElementById('budgetPreference').value = profile.travelPreferences.budget;
            
            // Set accommodation preferences
            profile.travelPreferences.accommodation.forEach(type => {
                const checkbox = document.querySelector(`input[value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            // Set transportation preferences
            profile.travelPreferences.transportation.forEach(type => {
                const checkbox = document.querySelector(`input[value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            // Set activity preferences
            profile.travelPreferences.activities.forEach(type => {
                const checkbox = document.querySelector(`input[value="${type}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Update interests
        if (profile.interests) {
            profile.interests.forEach(interest => {
                const checkbox = document.querySelector(`input[value="${interest}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Update destinations
        displayDestinations(profile.favoriteDestinations || []);
    }

    // Display destinations
    function displayDestinations(destinations) {
        const destinationsList = document.getElementById('destinationsList');
        if (!destinationsList) return;

        destinationsList.innerHTML = destinations.map(destination => `
            <div class="destination-card">
                <h3>${destination.name}</h3>
                <p class="country">${destination.country}</p>
                <p class="description">${destination.description}</p>
                <div class="destination-meta">
                    <span class="rating">${'★'.repeat(destination.rating)} ${'☆'.repeat(5 - destination.rating)}</span>
                    <span class="status">${destination.visited ? 'Visited' : 'Not Visited'}</span>
                </div>
                <div class="destination-actions">
                    <button class="btn-edit" onclick="editDestination('${destination._id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteDestination('${destination._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Save preferences
    async function savePreferences() {
        try {
            const preferences = {
                budget: document.getElementById('budgetPreference').value,
                accommodation: Array.from(document.querySelectorAll('input[type="checkbox"][name="accommodation"]:checked')).map(cb => cb.value),
                transportation: Array.from(document.querySelectorAll('input[type="checkbox"][name="transportation"]:checked')).map(cb => cb.value),
                activities: Array.from(document.querySelectorAll('input[type="checkbox"][name="activities"]:checked')).map(cb => cb.value)
            };

            const response = await fetch(`${PROFILE_URL}/preferences`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(preferences)
            });

            const data = await handleApiResponse(response);
            showSuccess('Preferences saved successfully');
        } catch (error) {
            handleApiError(error, 'Failed to save preferences');
        }
    }

    // Save interests
    async function saveInterests() {
        try {
            const interests = Array.from(document.querySelectorAll('input[type="checkbox"][name="interest"]:checked')).map(cb => cb.value);

            const response = await fetch(`${PROFILE_URL}/interests`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ interests })
            });

            const data = await handleApiResponse(response);
            showSuccess('Interests saved successfully');
        } catch (error) {
            handleApiError(error, 'Failed to save interests');
        }
    }

    // Add destination
    async function addDestination() {
        try {
            const formData = {
                name: document.getElementById('destinationName').value,
                country: document.getElementById('destinationCountry').value,
                description: document.getElementById('destinationDescription').value,
                visited: document.getElementById('destinationVisited').checked,
                rating: parseInt(document.getElementById('destinationRating').value)
            };

            const response = await fetch(`${PROFILE_URL}/favorite-destinations`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            showSuccess('Destination added successfully');
            displayDestinations(data.destinations);
            document.getElementById('addDestinationForm').reset();
        } catch (error) {
            handleApiError(error, 'Failed to add destination');
        }
    }

    // Delete destination
    async function deleteDestination(destinationId) {
        if (!confirm('Are you sure you want to delete this destination?')) return;

        try {
            const response = await fetch(`${PROFILE_URL}/favorite-destinations/${destinationId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            showSuccess('Destination removed successfully');
            displayDestinations(data.destinations);
        } catch (error) {
            handleApiError(error, 'Failed to remove destination');
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`${tab}Tab`).classList.add('active');
            });
        });

        // Save preferences
        document.getElementById('savePreferences').addEventListener('click', savePreferences);

        // Save interests
        document.getElementById('saveInterests').addEventListener('click', saveInterests);

        // Add destination
        document.getElementById('addDestinationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addDestination();
        });
    }

    return {
        initialize
    };
})();

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    profileManager.initialize();
});
