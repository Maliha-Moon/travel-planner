// API Configuration
const API_CONFIG = {
    BASE_URL: '/api',
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Authentication utilities
function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User not authenticated');
    }
    return {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
    };
}

// Error handling utilities
function handleApiError(error, message) {
    console.error('API Error:', error);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message || 'An error occurred. Please try again.';
    errorElement.style.color = 'red';
    errorElement.style.padding = '10px';
    errorElement.style.borderRadius = '4px';
    errorElement.style.margin = '10px 0';
    
    // Find the nearest form or container to display the error
    const target = document.querySelector('form, .container');
    if (target) {
        target.insertBefore(errorElement, target.firstChild);
    }
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Response handling utilities
function handleApiResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export { API_CONFIG, getAuthHeader, handleApiError, handleApiResponse };
