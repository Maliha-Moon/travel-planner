// Planning Manager Module
const planningManager = (function() {
    const PLANNING_URL = `${API_CONFIG.BASE_URL}/planning`;

    // Initialize planning page
    async function initialize(tripId) {
        try {
            // Load initial data
            await loadBudget(tripId);
            await loadPackingList(tripId);
            await loadChecklist(tripId);
            
            // Setup event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing planning:', error);
            showError('Failed to load planning data');
        }
    }

    // Budget Management
    async function loadBudget(tripId) {
        try {
            const response = await fetch(`${PLANNING_URL}/trips/${tripId}/budget`, {
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            displayBudget(data);
        } catch (error) {
            handleApiError(error, 'Failed to load budget');
        }
    }

    function displayBudget(data) {
        const { budget, usage } = data;
        
        // Update budget summary
        document.getElementById('totalBudget').textContent = budget.totalBudget;
        document.getElementById('spentAmount').textContent = usage.totalSpent;
        document.getElementById('remainingAmount').textContent = 
            budget.totalBudget - usage.totalSpent;

        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${usage.percentage}%`;

        // Display categories
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = budget.categories.map(category => `
            <div class="category-card">
                <h4>${category.name}</h4>
                <div class="category-amount">
                    <span>Allocated: $${category.allocatedAmount}</span>
                    <span>Spent: $${category.spentAmount}</span>
                    <span>Remaining: $${category.allocatedAmount - category.spentAmount}</span>
                </div>
                <div class="category-progress">
                    <div class="progress-bar" style="width: ${category.percentage}%"></div>
                </div>
            </div>
        `).join('');

        // Display expenses
        const expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = budget.expenses.map(expense => `
            <div class="expense-card">
                <h4>${expense.description}</h4>
                <div class="expense-details">
                    <span>Category: ${expense.category}</span>
                    <span>Amount: $${expense.amount}</span>
                    <span>Date: ${formatDate(expense.date)}</span>
                </div>
                <button onclick="deleteExpense('${expense._id}')">Delete</button>
            </div>
        `).join('');
    }

    async function addBudgetCategory() {
        const category = {
            name: prompt('Enter category name:'),
            allocatedAmount: parseFloat(prompt('Enter allocated amount:'))
        };

        try {
            const response = await fetch(`${PLANNING_URL}/trips/${tripId}/budget`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ categories: [...budget.categories, category] })
            });

            const data = await handleApiResponse(response);
            loadBudget(tripId);
        } catch (error) {
            handleApiError(error, 'Failed to add budget category');
        }
    }

    async function addExpense() {
        const expense = {
            category: prompt('Enter category:'),
            description: prompt('Enter description:'),
            amount: parseFloat(prompt('Enter amount:')),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch(`${PLANNING_URL}/trips/${tripId}/budget`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ expenses: [...budget.expenses, expense] })
            });

            const data = await handleApiResponse(response);
            loadBudget(tripId);
        } catch (error) {
            handleApiError(error, 'Failed to add expense');
        }
    }

    // Packing List Management
    async function loadPackingList(tripId) {
        try {
            const response = await fetch(`${PLANNING_URL}/trips/${tripId}/packing-list`, {
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            displayPackingList(data);
        } catch (error) {
            handleApiError(error, 'Failed to load packing list');
        }
    }

    function displayPackingList(data) {
        // Display categories
        const packingCategories = document.getElementById('packingCategories');
        packingCategories.innerHTML = data.categories.map(category => `
            <div class="category-card">
                <h4>${category.name}</h4>
                <div class="category-items">
                    ${category.items.map(item => `<span>${item}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Display items
        const packingItems = document.getElementById('packingItems');
        packingItems.innerHTML = data.items.map(item => `
            <div class="item-card">
                <input type="checkbox" onchange="togglePacked('${item._id}')">
                <span>${item.name}</span>
                <span class="quantity">x${item.quantity}</span>
                <span class="priority">${item.priority}</span>
                <button onclick="deleteItem('${item._id}')">Delete</button>
            </div>
        `).join('');

        // Display checklist
        const packingChecklist = document.getElementById('packingChecklist');
        packingChecklist.innerHTML = data.checklist.map(item => `
            <div class="checklist-item">
                <input type="checkbox" onchange="toggleChecklistItem('${item._id}')">
                <span>${item.name}</span>
                <span class="date">${formatDate(item.date)}</span>
                <span class="notes">${item.notes}</span>
            </div>
        `).join('');
    }

    // Travel Checklist Management
    async function loadChecklist(tripId) {
        try {
            const response = await fetch(`${PLANNING_URL}/trips/${tripId}/checklist`, {
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            displayChecklist(data);
        } catch (error) {
            handleApiError(error, 'Failed to load checklist');
        }
    }

    function displayChecklist(data) {
        // Display categories
        const checklistCategories = document.getElementById('checklistCategories');
        checklistCategories.innerHTML = data.categories.map(category => `
            <div class="category-card">
                <h4>${category.name}</h4>
                <div class="category-items">
                    ${category.items.map(item => `<span>${item}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Display tasks
        const checklistItems = document.getElementById('checklistItems');
        checklistItems.innerHTML = data.items.map(item => `
            <div class="task-card">
                <input type="checkbox" onchange="toggleTask('${item._id}')">
                <span>${item.name}</span>
                <span class="category">${item.category}</span>
                <span class="priority">${item.priority}</span>
                <span class="due-date">${formatDate(item.dueDate)}</span>
                <span class="notes">${item.notes}</span>
            </div>
        `).join('');

        // Display reminders
        const remindersList = document.getElementById('remindersList');
        remindersList.innerHTML = data.reminders.map(reminder => `
            <div class="reminder-card">
                <h4>${reminder.name}</h4>
                <span>${formatDate(reminder.date)} ${reminder.time}</span>
                <span>${reminder.notes}</span>
                <button onclick="deleteReminder('${reminder._id}')">Delete</button>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Budget
        document.getElementById('addBudgetCategoryBtn').addEventListener('click', addBudgetCategory);
        document.getElementById('addExpenseBtn').addEventListener('click', addExpense);

        // Packing List
        document.getElementById('addPackingCategoryBtn').addEventListener('click', addPackingCategory);
        document.getElementById('addPackingItemBtn').addEventListener('click', addPackingItem);

        // Travel Checklist
        document.getElementById('addChecklistCategoryBtn').addEventListener('click', addChecklistCategory);
        document.getElementById('addChecklistItemBtn').addEventListener('click', addChecklistItem);
        document.getElementById('addReminderBtn').addEventListener('click', addReminder);
    }

    // Helper functions
    function formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return {
        initialize
    };
})();

// Initialize planning when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tripId = new URLSearchParams(window.location.search).get('tripId');
    if (tripId) {
        planningManager.initialize(tripId);
    }
});
