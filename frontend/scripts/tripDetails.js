// Initialize API client
const api = new ApiClient();

// DOM Elements
const tripTitle = document.getElementById('tripTitle');
const tripStatus = document.getElementById('tripStatus');
const tripDates = document.getElementById('tripDates');
const tripDescription = document.getElementById('tripDescription');
const destinationsList = document.querySelector('.destinations-list');
const expensesList = document.querySelector('.expenses-list');
const documentsList = document.querySelector('.documents-list');
const weatherInfo = document.querySelector('.weather-info');

// Edit controls
const editTripBtn = document.getElementById('editTripBtn');
const saveTripBtn = document.getElementById('saveTripBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Editable elements
const editableElements = {
    title: document.createElement('input'),
    description: document.createElement('textarea'),
    startDate: document.createElement('input'),
    endDate: document.createElement('input'),
    status: document.createElement('select')
};

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const tripId = urlParams.get('id');

// Initialize status select options
editableElements.status.innerHTML = `
    <option value="planning">Planning</option>
    <option value="active">Active</option>
    <option value="completed">Completed</option>
`;
editableElements.startDate.type = 'date';
editableElements.endDate.type = 'date';
editableElements.description.rows = 3;

// Event listeners for edit controls
editTripBtn.addEventListener('click', toggleEditMode);
saveTripBtn.addEventListener('click', saveTripChanges);
cancelEditBtn.addEventListener('click', toggleEditMode);

// Initialize tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Add click event listeners to tab buttons
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.remove('active'));
        // Show selected tab content
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Load trip details
async function loadTripDetails() {
    try {
        const response = await api.get(`/api/trips/${tripId}`);
        const trip = response.data;
        
        // Update trip information
        tripTitle.textContent = trip.title;
        tripStatus.textContent = trip.status.charAt(0).toUpperCase() + trip.status.slice(1);
        tripStatus.classList.add(`status-${trip.status}`);
        tripDates.textContent = `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;
        tripDescription.textContent = trip.description || '';
        
        // Initialize editable elements
        editableElements.title.value = trip.title;
        editableElements.description.value = trip.description || '';
        editableElements.startDate.value = trip.startDate;
        editableElements.endDate.value = trip.endDate;
        editableElements.status.value = trip.status;
        
        // Render destinations
        renderDestinations(trip.destinations);
        
        // Load weather information
        await loadWeatherInformation(trip.destinations);
    } catch (error) {
        console.error('Error loading trip details:', error);
        showError('Failed to load trip details');
    }
}

// Toggle edit mode
function toggleEditMode() {
    const isEditMode = editTripBtn.style.display === 'none';
    
    // Toggle visibility of buttons
    editTripBtn.style.display = isEditMode ? 'block' : 'none';
    saveTripBtn.style.display = isEditMode ? 'none' : 'block';
    cancelEditBtn.style.display = isEditMode ? 'none' : 'block';
    
    // Toggle editable elements
    const elements = [tripTitle, tripDescription, tripDates, tripStatus];
    elements.forEach(element => {
        if (isEditMode) {
            if (element.id === 'tripTitle') {
                element.parentNode.insertBefore(editableElements.title, element);
            } else if (element.id === 'tripDescription') {
                element.parentNode.insertBefore(editableElements.description, element);
            } else if (element.id === 'tripDates') {
                const datesContainer = element.parentNode;
                datesContainer.insertBefore(editableElements.startDate, element);
                datesContainer.insertBefore(editableElements.endDate, element);
            } else if (element.id === 'tripStatus') {
                element.parentNode.insertBefore(editableElements.status, element);
            }
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
            // Remove editable elements
            editableElements.title.remove();
            editableElements.description.remove();
            editableElements.startDate.remove();
            editableElements.endDate.remove();
            editableElements.status.remove();
        }
    });
}

// Save trip changes
async function saveTripChanges() {
    try {
        const tripData = {
            title: editableElements.title.value,
            description: editableElements.description.value,
            startDate: editableElements.startDate.value,
            endDate: editableElements.endDate.value,
            status: editableElements.status.value
        };
        
        await api.put(`/api/trips/${tripId}`, tripData);
        await loadTripDetails();
        toggleEditMode();
    } catch (error) {
        console.error('Error saving trip changes:', error);
        showError('Failed to save trip changes');
    }
}

// Render destinations
function renderDestinations(destinations) {
    destinationsList.innerHTML = destinations.map(destination => `
        <div class="destination-card">
            <div class="destination-header">
                <h3 class="destination-title">${destination.name}</h3>
                <span class="destination-dates">
                    ${new Date(destination.arrivalDate).toLocaleDateString()} - ${new Date(destination.departureDate).toLocaleDateString()}
                </span>
            </div>
            <div class="activities-list">
                ${destination.activities.map(activity => `
                    <div class="activity-item">
                        <div>
                            <h4>${activity.name}</h4>
                            <p class="activity-time">${new Date(activity.startTime).toLocaleTimeString()} - ${new Date(activity.endTime).toLocaleTimeString()}</p>
                            <p class="activity-category">${activity.category}</p>
                        </div>
                        <div class="activity-cost">$${activity.cost}</div>
                    </div>
                `).join('')}
            </div>
            <div class="destination-total">
                <p>Total Cost: $${destination.totalCost}</p>
            </div>
        </div>
    `).join('');
}

// Load weather information
async function loadWeatherInformation(destinations) {
    // You'll need to implement weather API integration here
    // For now, this is a placeholder
    weatherInfo.innerHTML = destinations.map(destination => `
        <div class="weather-card">
            <h3>${destination.name}</h3>
            <div class="weather-data">
                <p>Loading weather data...</p>
            </div>
        </div>
    `).join('');
}

// Handle add destination
addDestinationBtn.addEventListener('click', async () => {
    try {
        const destination = await showDestinationModal();n        if (destination) {
            await api.post(`/api/trips/${tripId}/destinations`, destination);
            await loadTripDetails();
        }
    } catch (error) {
        console.error('Error adding destination:', error);
        showError('Failed to add destination');
    }
});

// Handle add expense
addExpenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = {
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDescription').value
        };
        
        await api.post(`/api/trips/${tripId}/expenses`, formData);
        await loadTripDetails();
        addExpenseForm.reset();
    } catch (error) {
        console.error('Error adding expense:', error);
        showError('Failed to add expense');
    }
});

// Loading states
const loadingStates = {
    trip: false,
    weather: false,
    documents: false,
    expenses: false
};

// Error messages
const errorMessages = {
    trip: null,
    weather: null,
    documents: null,
    expenses: null
};

// Show loading state
function showLoading(stateKey) {
    loadingStates[stateKey] = true;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-state';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading...</p>
    `;
    
    const content = document.querySelector(`#${stateKey}`);
    if (content) {
        content.innerHTML = '';
        content.appendChild(loadingDiv);
    }
}

// Hide loading state
function hideLoading(stateKey) {
    loadingStates[stateKey] = false;
    const content = document.querySelector(`#${stateKey}`);
    if (content) {
        content.innerHTML = '';
    }
}

// Show error message
function showError(stateKey, message) {
    errorMessages[stateKey] = message;
    const content = document.querySelector(`#${stateKey}`);
    if (content) {
        content.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Initialize page
async function initializePage() {
    try {
        showLoading('trip');
        await loadTripDetails();
        hideLoading('trip');
    } catch (error) {
        showError('trip', 'Failed to load trip details');
        console.error('Error initializing page:', error);
    }
}

initializePage();

// Update loadWeatherInformation to use weather API
async function loadWeatherInformation(destinations) {
    try {
        showLoading('weather');
        
        const weatherPromises = destinations.map(destination => {
            return api.get(`/api/weather/${destination.name}`).then(response => {
                return {
                    destination: destination.name,
                    ...response.data
                };
            });
        });

        const weatherData = await Promise.all(weatherPromises);
        
        weatherInfo.innerHTML = weatherData.map(data => `
            <div class="weather-card">
                <h3>${data.destination}</h3>
                <div class="weather-data">
                    <div class="weather-item">
                        <img src="${data.icon}" alt="Weather icon">
                        <p>${Math.round(data.temperature)}°C</p>
                    </div>
                    <div class="weather-item">
                        <p>${data.description}</p>
                    </div>
                    <div class="weather-item">
                        <p>Humidity: ${data.humidity}%</p>
                    </div>
                    <div class="weather-item">
                        <p>Wind: ${data.windSpeed} km/h</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        hideLoading('weather');
    } catch (error) {
        showError('weather', 'Failed to load weather information');
        console.error('Error loading weather:', error);
    }
}

// Update addExpenseForm to include currency conversion
addExpenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        showLoading('expenses');
        
        const formData = {
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDescription').value,
            currency: document.getElementById('expenseCurrency').value
        };
        
        // Convert to base currency if needed
        if (formData.currency !== 'USD') {
            const response = await api.get(`/api/currency/convert`, {
                params: {
                    amount: formData.amount,
                    from: formData.currency,
                    to: 'USD'
                }
            });
            formData.amount = response.data.amount;
        }
        
        await api.post(`/api/trips/${tripId}/expenses`, formData);
        await loadTripDetails();
        addExpenseForm.reset();
        hideLoading('expenses');
    } catch (error) {
        showError('expenses', 'Failed to add expense');
        console.error('Error adding expense:', error);
        hideLoading('expenses');
    }
});

// Add file upload functionality
async function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        showLoading('documents');
        const response = await api.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const documentData = {
            title: file.name,
            type: file.type,
            fileUrl: response.data.file.url,
            notes: ''
        };

        await api.post(`/api/trips/${tripId}/documents`, documentData);
        await loadTripDetails();
        hideLoading('documents');
    } catch (error) {
        showError('documents', 'Failed to upload document');
        console.error('Error uploading document:', error);
        hideLoading('documents');
    }
}

// Add file input to documents section
documentsList.innerHTML += `
    <div class="add-document-section">
        <input type="file" id="documentFile" accept=".pdf,.jpg,.jpeg,.png">
        <button class="btn-primary" onclick="document.getElementById('documentFile').click()">Add Document</button>
    </div>
`;

document.getElementById('documentFile').addEventListener('change', handleFileUpload);
