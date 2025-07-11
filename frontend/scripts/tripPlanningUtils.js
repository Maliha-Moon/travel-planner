// Trip Planning Utilities
const tripPlanningUtils = (function() {
    // Initialize date picker for itinerary
    function initializeDatePicker() {
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            const today = new Date();
            const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            datePicker.min = minDate.toISOString().split('T')[0];
            
            datePicker.addEventListener('change', function() {
                loadItineraryForDate(this.value);
            });
        }
    }

    // Load activities for selected date
    async function loadItineraryForDate(date) {
        const tripId = getActiveTripId();
        if (!tripId) return;
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/trips/${tripId}/activities?date=${date}`, {
                headers: getAuthHeader()
            });
            
            const data = await handleApiResponse(response);
            displayActivities(data.activities);
        } catch (error) {
            handleApiError(error, 'Failed to load activities');
        }
    }

    // Display activities in the itinerary container
    function displayActivities(activities) {
        const container = document.getElementById('itineraryContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        activities.forEach(activity => {
            const activityCard = createActivityCard(activity);
            container.appendChild(activityCard);
        });
    }

    // Create an activity card element
    function createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        card.innerHTML = `
            <div class="activity-header">
                <h3>${activity.name}</h3>
                <div class="activity-time">
                    <span>${formatTime(activity.startTime)}</span>
                    <span>to</span>
                    <span>${formatTime(activity.endTime)}</span>
                </div>
            </div>
            <div class="activity-details">
                <p>${activity.description || 'No description'}</p>
                <div class="activity-meta">
                    <span class="category">${activity.category}</span>
                    <span class="location">${activity.location || 'Location not specified'}</span>
                </div>
            </div>
            <div class="activity-actions">
                <button class="btn-edit" onclick="editActivity('${activity._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteActivity('${activity._id}')">Delete</button>
            </div>
        `;
        
        return card;
    }

    // Format time for display
    function formatTime(time) {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Get active trip ID from URL or localStorage
    function getActiveTripId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tripId') || localStorage.getItem('activeTripId');
    }

    // Initialize expense tracking
    function initializeExpenseTracking() {
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const tripId = getActiveTripId();
                if (!tripId) return;
                
                const expenseData = {
                    category: document.getElementById('expenseCategory').value,
                    amount: parseFloat(document.getElementById('expenseAmount').value),
                    description: document.getElementById('expenseDescription').value
                };
                
                try {
                    await tripManager.addExpense(tripId, expenseData);
                    expenseForm.reset();
                    loadExpenses(tripId);
                } catch (error) {
                    handleApiError(error, 'Failed to add expense');
                }
            });
        }
    }

    // Load expenses for a trip
    async function loadExpenses(tripId) {
        try {
            const expenses = await tripManager.getTripExpenses(tripId);
            displayExpenses(expenses);
        } catch (error) {
            handleApiError(error, 'Failed to load expenses');
        }
    }

    // Display expenses in the UI
    function displayExpenses(expenses) {
        const container = document.getElementById('expensesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        expenses.forEach(expense => {
            const expenseCard = createExpenseCard(expense);
            container.appendChild(expenseCard);
        });
    }

    // Create an expense card element
    function createExpenseCard(expense) {
        const card = document.createElement('div');
        card.className = 'expense-card';
        
        card.innerHTML = `
            <div class="expense-header">
                <h3>${expense.description || 'Expense'}</h3>
                <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
            </div>
            <div class="expense-details">
                <span class="category">${expense.category}</span>
                <span class="date">${new Date(expense.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense('${expense._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteExpense('${expense._id}')">Delete</button>
            </div>
        `;
        
        return card;
    }

    // Initialize document management
    function initializeDocumentManagement() {
        const documentForm = document.getElementById('documentForm');
        if (documentForm) {
            documentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const tripId = getActiveTripId();
                if (!tripId) return;
                
                const formData = new FormData(documentForm);
                const documentData = {
                    title: formData.get('documentTitle'),
                    type: formData.get('documentType'),
                    notes: formData.get('documentNotes')
                };
                
                try {
                    await tripManager.addDocument(tripId, documentData);
                    documentForm.reset();
                    loadDocuments(tripId);
                } catch (error) {
                    handleApiError(error, 'Failed to add document');
                }
            });
        }
    }

    // Load documents for a trip
    async function loadDocuments(tripId) {
        try {
            const documents = await tripManager.getTripDocuments(tripId);
            displayDocuments(documents);
        } catch (error) {
            handleApiError(error, 'Failed to load documents');
        }
    }

    // Display documents in the UI
    function displayDocuments(documents) {
        const container = document.getElementById('documentsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        documents.forEach(document => {
            const documentCard = createDocumentCard(document);
            container.appendChild(documentCard);
        });
    }

    // Create a document card element
    function createDocumentCard(document) {
        const card = document.createElement('div');
        card.className = 'document-card';
        
        card.innerHTML = `
            <div class="document-header">
                <h3>${document.title}</h3>
                <span class="document-type">${document.type}</span>
            </div>
            <div class="document-details">
                <p>${document.notes || 'No notes'}</p>
                <span class="upload-date">Uploaded: ${new Date(document.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div class="document-actions">
                <a href="${document.fileUrl}" target="_blank" class="btn-view">View</a>
                <button class="btn-edit" onclick="editDocument('${document._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteDocument('${document._id}')">Delete</button>
            </div>
        `;
        
        return card;
    }

    // Initialize all trip planning features
    function initialize() {
        initializeDatePicker();
        initializeExpenseTracking();
        initializeDocumentManagement();
    }

    return {
        initialize,
        loadItineraryForDate,
        loadExpenses,
        loadDocuments
    };
})();

// Initialize trip planning utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    tripPlanningUtils.initialize();
});
