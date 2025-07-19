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
const addDestinationBtn = document.getElementById('addDestinationBtn');

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

// Add classes for styling
editableElements.title.className = 'form-control';
editableElements.description.className = 'form-control';
editableElements.startDate.className = 'form-control';
editableElements.endDate.className = 'form-control';
editableElements.status.className = 'form-control';

// Event listeners for edit controls
if (editTripBtn) editTripBtn.addEventListener('click', toggleEditMode);
if (saveTripBtn) saveTripBtn.addEventListener('click', saveTripChanges);
if (cancelEditBtn) cancelEditBtn.addEventListener('click', toggleEditMode);

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
        const targetTab = document.getElementById(btn.dataset.tab);
        if (targetTab) targetTab.classList.add('active');
    });
});

// Load trip details
async function loadTripDetails() {
    if (!tripId) {
        showError('Failed to load trip: No trip ID provided');
        return;
    }

    try {
        showLoading('Loading trip details...');
        const response = await api.get(`/api/trips/${tripId}`);
        const trip = response.data;
        
        // Update trip information
        if (tripTitle) tripTitle.textContent = trip.title || 'Untitled Trip';
        
        if (tripStatus) {
            tripStatus.textContent = trip.status 
                ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1)
                : 'Not Specified';
            // Reset classes and add status class
            tripStatus.className = 'status';
            if (trip.status) tripStatus.classList.add(`status-${trip.status}`);
        }
        
        if (tripDates) {
            const startDate = trip.startDate ? new Date(trip.startDate) : null;
            const endDate = trip.endDate ? new Date(trip.endDate) : null;
            
            if (startDate && endDate) {
                tripDates.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            } else if (startDate) {
                tripDates.textContent = `Starts: ${startDate.toLocaleDateString()}`;
            } else if (endDate) {
                tripDates.textContent = `Ends: ${endDate.toLocaleDateString()}`;
            } else {
                tripDates.textContent = 'No dates specified';
            }
        }
        
        if (tripDescription) {
            tripDescription.textContent = trip.description || 'No description provided';
        }
        
        // Initialize editable elements with fallbacks
        editableElements.title.value = trip.title || '';
        editableElements.description.value = trip.description || '';
        editableElements.startDate.value = trip.startDate || '';
        editableElements.endDate.value = trip.endDate || '';
        editableElements.status.value = trip.status || 'planning';
        
        // Render destinations if container exists
        if (destinationsList) {
            renderDestinations(trip.destinations || []);
        }
        
        // Load weather information if container exists
        if (weatherInfo) {
            await loadWeatherInformation(trip.destinations || []);
        }
        
        // Hide loading state
        hideLoading();
    } catch (error) {
        console.error('Error loading trip details:', error);
        showError(error.response?.data?.message || 'Failed to load trip details');
        hideLoading();
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
    if (!destinationsList) return;
    
    try {
        // Handle empty destinations array
        if (!Array.isArray(destinations) || destinations.length === 0) {
            destinationsList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-map-marker-alt"></i>
                    <p>No destinations added yet</p>
                    ${addDestinationBtn ? '' : '<button class="btn btn-primary" id="addDestinationBtn">Add Destination</button>'}
                </div>`;
            
            // Add event listener if we just created the button
            const newAddBtn = document.getElementById('addDestinationBtn');
            if (newAddBtn && !addDestinationBtn) {
                newAddBtn.addEventListener('click', showDestinationModal);
            }
            return;
        }
        
        // Process and render destinations
        destinationsList.innerHTML = destinations.map((destination, index) => {
            // Validate destination data
            const destinationName = destination.name || 'Unnamed Destination';
            const arrivalDate = destination.arrivalDate ? new Date(destination.arrivalDate) : null;
            const departureDate = destination.departureDate ? new Date(destination.departureDate) : null;
            
            // Format date range
            let dateRange = 'No dates specified';
            if (arrivalDate && departureDate) {
                dateRange = `${arrivalDate.toLocaleDateString()} - ${departureDate.toLocaleDateString()}`;
            } else if (arrivalDate) {
                dateRange = `Arrival: ${arrivalDate.toLocaleDateString()}`;
            } else if (departureDate) {
                dateRange = `Departure: ${departureDate.toLocaleDateString()}`;
            }
            
            // Calculate total cost from activities if not provided
            let totalCost = 0;
            if (typeof destination.totalCost === 'number') {
                totalCost = destination.totalCost;
            } else if (Array.isArray(destination.activities)) {
                totalCost = destination.activities.reduce((sum, activity) => {
                    return sum + (parseFloat(activity.cost) || 0);
                }, 0);
            }
            
            // Render activities if they exist
            const activitiesHtml = Array.isArray(destination.activities) && destination.activities.length > 0
                ? `
                    <div class="activities-list">
                        ${destination.activities.map((activity, activityIndex) => {
                            const startTime = activity.startTime ? new Date(activity.startTime) : null;
                            const endTime = activity.endTime ? new Date(activity.endTime) : null;
                            
                            let timeHtml = '';
                            if (startTime) {
                                timeHtml = `
                                    <p class="activity-time">
                                        ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        ${endTime ? ` - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                                    </p>`;
                            }
                            
                            return `
                                <div class="activity-item" data-activity-id="${activity._id || `activity-${index}-${activityIndex}`}">
                                    <div class="activity-details">
                                        <h4>${activity.name || 'Unnamed Activity'}</h4>
                                        ${timeHtml}
                                        ${activity.location ? `<p class="activity-location"><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>` : ''}
                                        ${activity.notes ? `<p class="activity-notes">${activity.notes}</p>` : ''}
                                        ${activity.category ? `<span class="activity-category">${activity.category}</span>` : ''}
                                    </div>
                                    ${activity.cost ? `
                                        <div class="activity-cost">
                                            ${formatCurrency(parseFloat(activity.cost))}
                                        </div>
                                    ` : ''}
                                    <div class="activity-actions">
                                        <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                                        <button class="btn-icon" title="Delete"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>`
                : '<div class="no-activities">No activities planned yet.</div>';
            
            // Main destination card template
            return `
                <div class="destination-card" data-destination-id="${destination._id || `dest-${index}`}">
                    <div class="destination-header">
                        <div>
                            <h3 class="destination-title">
                                <i class="fas fa-map-marker-alt"></i>
                                ${destinationName}
                            </h3>
                            <span class="destination-dates">
                                <i class="far fa-calendar-alt"></i>
                                ${dateRange}
                            </span>
                        </div>
                        <div class="destination-actions">
                            <button class="btn-icon" title="Edit Destination">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" title="Delete Destination">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="destination-content">
                        ${activitiesHtml}
                        
                        <div class="destination-footer">
                            <button class="btn btn-sm btn-outline" data-action="add-activity">
                                <i class="fas fa-plus"></i> Add Activity
                            </button>
                            ${totalCost > 0 ? `
                                <div class="destination-total">
                                    <span>Estimated Cost:</span>
                                    <strong>${formatCurrency(totalCost)}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
        
        // Add event listeners after rendering
        setupDestinationEventListeners();
        
    } catch (error) {
        console.error('Error rendering destinations:', error);
        destinationsList.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load destinations. Please try again later.</p>
                <button class="btn btn-sm" onclick="loadTripDetails()">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>`;
    }
}

// Setup event listeners for destination elements
function setupDestinationEventListeners() {
    // Add activity buttons
    document.querySelectorAll('[data-action="add-activity"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.destination-card');
            const destinationId = card ? card.dataset.destinationId : null;
            showActivityModal(destinationId);
        });
    });
    
    // Edit destination buttons
    document.querySelectorAll('.destination-actions [title*="Edit"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.destination-card');
            const destinationId = card ? card.dataset.destinationId : null;
            // TODO: Implement edit destination
            console.log('Edit destination:', destinationId);
        });
    });
    
    // Delete destination buttons
    document.querySelectorAll('.destination-actions [title*="Delete"]').forEach(button => {
        button.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
                const card = e.target.closest('.destination-card');
                const destinationId = card ? card.dataset.destinationId : null;
                if (destinationId) {
                    try {
                        await api.delete(`/api/trips/${tripId}/destinations/${destinationId}`);
                        await loadTripDetails(); // Refresh the view
                    } catch (error) {
                        console.error('Error deleting destination:', error);
                        showError('Failed to delete destination');
                    }
                }
            }
        });
    });
}

// Load weather information
async function loadWeatherInformation(destinations) {
    if (!weatherInfo) return;
    
    try {
        // Show loading state
        weatherInfo.innerHTML = `
            <div class="weather-loading">
                <div class="spinner"></div>
                <p>Loading weather information...</p>
            </div>`;
        
        // Process each destination for weather data
        const weatherPromises = destinations.map(async (destination) => {
            try {
                if (!destination.name) return null;
                
                // Call your weather API here
                // Example: const response = await fetch(`/api/weather?location=${encodeURIComponent(destination.name)}`);
                // const weatherData = await response.json();
                
                // Mock data for demonstration
                const mockWeather = {
                    temp: Math.round(Math.random() * 30) + 10, // 10-40°C
                    condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)],
                    icon: '☀️',
                    humidity: Math.round(Math.random() * 50) + 30, // 30-80%
                    wind: (Math.random() * 20 + 5).toFixed(1), // 5-25 km/h
                    feelsLike: Math.round(Math.random() * 30) + 5, // 5-35°C
                    precipitation: Math.round(Math.random() * 100) // 0-100%
                };
                
                // Get appropriate weather icon based on condition
                const getWeatherIcon = (condition) => {
                    const icons = {
                        'Sunny': '☀️',
                        'Partly Cloudy': '⛅',
                        'Cloudy': '☁️',
                        'Rainy': '🌧️',
                        'Stormy': '⛈️',
                        'Snowy': '❄️',
                        'Foggy': '🌫️'
                    };
                    return icons[condition] || '🌡️';
                };
                
                mockWeather.icon = getWeatherIcon(mockWeather.condition);
                
                return {
                    destination: destination.name,
                    weather: mockWeather,
                    lastUpdated: new Date().toLocaleTimeString()
                };
                
            } catch (error) {
                console.error(`Error fetching weather for ${destination.name}:`, error);
                return {
                    destination: destination.name,
                    error: 'Failed to load weather data',
                    lastUpdated: new Date().toLocaleTimeString()
                };
            }
        });
        
        // Wait for all weather data to load
        const weatherResults = await Promise.all(weatherPromises);
        
        // Filter out any null results
        const validResults = weatherResults.filter(result => result !== null);
        
        if (validResults.length === 0) {
            weatherInfo.innerHTML = `
                <div class="no-weather">
                    <i class="fas fa-cloud-sun"></i>
                    <p>No weather data available for the destinations</p>
                </div>`;
            return;
        }
        
        // Render weather cards
        weatherInfo.innerHTML = validResults.map(result => {
            if (result.error) {
                return `
                    <div class="weather-card error">
                        <h3>${result.destination}</h3>
                        <div class="weather-data">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>${result.error}</p>
                            <button class="btn btn-sm btn-outline" onclick="loadWeatherInformation([{name: '${result.destination}'}])">
                                <i class="fas fa-sync-alt"></i> Retry
                            </button>
                        </div>
                        <div class="weather-footer">
                            <small>Last updated: ${result.lastUpdated}</small>
                        </div>
                    </div>`;
            }
            
            const w = result.weather;
            return `
                <div class="weather-card">
                    <div class="weather-header">
                        <h3>${result.destination}</h3>
                        <span class="last-updated">Updated: ${result.lastUpdated}</span>
                    </div>
                    
                    <div class="weather-main">
                        <div class="weather-temp">
                            <span class="temp">${w.temp}°C</span>
                            <span class="condition">
                                <span class="weather-icon">${w.icon}</span>
                                ${w.condition}
                            </span>
                            <span class="feels-like">Feels like ${w.feelsLike}°C</span>
                        </div>
                        
                        <div class="weather-details">
                            <div class="detail">
                                <i class="fas fa-tint"></i>
                                <div>
                                    <span>Humidity</span>
                                    <strong>${w.humidity}%</strong>
                                </div>
                            </div>
                            <div class="detail">
                                <i class="fas fa-wind"></i>
                                <div>
                                    <span>Wind</span>
                                    <strong>${w.wind} km/h</strong>
                                </div>
                            </div>
                            <div class="detail">
                                <i class="fas fa-cloud-rain"></i>
                                <div>
                                    <span>Precip</span>
                                    <strong>${w.precipitation}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="weather-actions">
                        <button class="btn btn-sm btn-outline" 
                                onclick="loadWeatherInformation([{name: '${result.destination}'}])">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="btn btn-sm btn-primary" 
                                onclick="showWeatherForecast('${result.destination}')">
                            <i class="fas fa-calendar-alt"></i> Forecast
                        </button>
                    </div>
                </div>`;
        }).join('');
        
    } catch (error) {
        console.error('Error loading weather information:', error);
        weatherInfo.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load weather information</p>
                <button class="btn btn-sm" onclick="loadWeatherInformation(${JSON.stringify(destinations)})">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>`;
    }
}

// Show weather forecast modal (placeholder function)
function showWeatherForecast(destination) {
    // This would be implemented to show a detailed forecast modal
    alert(`Showing forecast for ${destination}. This feature would display a detailed weather forecast.`);
}

// Handle add destination
addDestinationBtn.addEventListener('click', async () => {
    try {
        const destination = await showDestinationModal();
        if (destination) {
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
