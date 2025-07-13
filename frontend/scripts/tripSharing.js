// Trip Sharing Module
const tripSharing = (function() {
    const TRIP_URL = `${API_CONFIG.BASE_URL}/social/trips`;

    // Initialize trip sharing
    async function initialize(tripId) {
        try {
            // Load shared users
            const sharedUsers = await getSharedUsers(tripId);
            updateSharedUsersUI(sharedUsers);
            
            // Setup event listeners
            setupEventListeners(tripId);
        } catch (error) {
            console.error('Error initializing trip sharing:', error);
            showError('Failed to load shared users');
        }
    }

    // Get shared users
    async function getSharedUsers(tripId) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}/shared-users`, {
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            return data.sharedUsers;
        } catch (error) {
            handleApiError(error, 'Failed to fetch shared users');
            throw error;
        }
    }

    // Share trip with users
    async function shareTrip(tripId, userIds) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}/share`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ userIds })
            });

            const data = await handleApiResponse(response);
            showSuccess('Trip shared successfully');
            updateSharedUsersUI(data.sharedUsers);
        } catch (error) {
            handleApiError(error, 'Failed to share trip');
        }
    }

    // Unshare trip from user
    async function unshareTrip(tripId, userId) {
        try {
            const response = await fetch(`${TRIP_URL}/${tripId}/shared-users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            showSuccess('Trip unshared successfully');
            updateSharedUsersUI(data.sharedUsers);
        } catch (error) {
            handleApiError(error, 'Failed to unshare trip');
        }
    }

    // Update shared users UI
    function updateSharedUsersUI(sharedUsers) {
        const sharedUsersList = document.getElementById('sharedUsersList');
        if (!sharedUsersList) return;

        sharedUsersList.innerHTML = sharedUsers.map(user => `
            <div class="shared-user">
                <img src="${user.profilePicture || '../assets/default-profile.jpg'}" alt="${user.username}">
                <span class="username">${user.username}</span>
                <button class="btn-unshare" onclick="unshareTrip('${tripId}', '${user._id}')">
                    Unshare
                </button>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners(tripId) {
        // Share trip button
        document.getElementById('shareTripBtn').addEventListener('click', () => {
            showShareModal(tripId);
        });
    }

    // Show share modal
    function showShareModal(tripId) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Share Trip</h3>
                <div class="search-users">
                    <input type="text" id="searchUsers" placeholder="Search users...">
                    <div class="search-results" id="searchResults"></div>
                </div>
                <div class="selected-users" id="selectedUsers"></div>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeModal(this)">Cancel</button>
                    <button class="btn-share" onclick="shareSelectedUsers('${tripId}')">Share</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setupModalEventListeners(modal);
    }

    // Setup modal event listeners
    function setupModalEventListeners(modal) {
        const searchInput = modal.querySelector('#searchUsers');
        const searchResults = modal.querySelector('#searchResults');
        
        searchInput.addEventListener('input', debounce(searchUsers, 300));

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }

    // Search users
    async function searchUsers() {
        const query = this.value;
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/social/search/users?q=${query}`, {
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            displaySearchResults(data.users);
        } catch (error) {
            handleApiError(error, 'Failed to search users');
        }
    }

    // Display search results
    function displaySearchResults(users) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.innerHTML = users.map(user => `
            <div class="search-result" onclick="selectUser('${user._id}', '${user.username}')">
                <img src="${user.profilePicture || '../assets/default-profile.jpg'}" alt="${user.username}">
                <span>${user.username}</span>
            </div>
        `).join('');
    }

    // Select user
    function selectUser(userId, username) {
        const selectedUsers = document.getElementById('selectedUsers');
        if (!selectedUsers) return;

        const userElement = document.createElement('div');
        userElement.className = 'selected-user';
        userElement.innerHTML = `
            <img src="${user.profilePicture || '../assets/default-profile.jpg'}" alt="${username}">
            <span>${username}</span>
            <button class="btn-remove" onclick="removeUser('${userId}')">×</button>
        `;
        userElement.dataset.userId = userId;
        selectedUsers.appendChild(userElement);
    }

    // Remove user from selection
    function removeUser(userId) {
        const selectedUsers = document.getElementById('selectedUsers');
        if (!selectedUsers) return;

        const userElement = selectedUsers.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            userElement.remove();
        }
    }

    // Share selected users
    async function shareSelectedUsers(tripId) {
        const selectedUsers = document.getElementById('selectedUsers');
        if (!selectedUsers) return;

        const userIds = Array.from(selectedUsers.children).map(user => user.dataset.userId);
        if (userIds.length === 0) {
            showError('Please select at least one user');
            return;
        }

        await shareTrip(tripId, userIds);
        closeModal(document.querySelector('.share-modal'));
    }

    // Close modal
    function closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }

    return {
        initialize
    };
})();
