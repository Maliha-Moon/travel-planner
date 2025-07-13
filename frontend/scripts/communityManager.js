// Community Manager Module
const communityManager = (function() {
    const COMMUNITY_URL = `${API_CONFIG.BASE_URL}/social`;

    // Initialize community page
    async function initialize() {
        try {
            // Load initial tips
            await loadTips();
            
            // Setup event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing community:', error);
            showError('Failed to load community feed');
        }
    }

    // Load tips with filters
    async function loadTips(filters = {}) {
        try {
            const response = await fetch(`${COMMUNITY_URL}/tips`, {
                headers: getAuthHeader(),
                method: 'GET',
                params: filters
            });

            const data = await handleApiResponse(response);
            displayTips(data.tips);
        } catch (error) {
            handleApiError(error, 'Failed to load tips');
        }
    }

    // Display tips in the feed
    function displayTips(tips) {
        const tipsFeed = document.getElementById('tipsFeed');
        if (!tipsFeed) return;

        tipsFeed.innerHTML = tips.map(tip => createTipCard(tip)).join('');
    }

    // Create tip card HTML
    function createTipCard(tip) {
        return `
            <div class="tip-card" data-tip-id="${tip._id}">
                <div class="tip-header">
                    <div class="user-info">
                        <img src="${tip.profilePicture || '../assets/default-profile.jpg'}" alt="${tip.userName}">
                        <div class="user-details">
                            <span class="username">${tip.userName}</span>
                            <span class="time">${formatTime(tip.createdAt)}</span>
                        </div>
                    </div>
                    <div class="tip-meta">
                        <span class="category">#${tip.category}</span>
                        <span class="views">${formatNumber(tip.views)} views</span>
                    </div>
                </div>
                <div class="tip-content">
                    <h3>${tip.title}</h3>
                    <p>${tip.content}</p>
                </div>
                <div class="tip-actions">
                    <button class="btn-like" onclick="toggleLike('${tip._id}')">
                        <i class="like-icon ${tip.likes.includes(userId) ? 'liked' : ''}"></i>
                        <span>${formatNumber(tip.likeCount)}</span>
                    </button>
                    <button class="btn-comment" onclick="showComments('${tip._id}')">
                        <i class="comment-icon"></i>
                        <span>${formatNumber(tip.commentCount)}</span>
                    </button>
                    <button class="btn-share" onclick="shareTip('${tip._id}')">
                        <i class="share-icon"></i>
                    </button>
                </div>
                <div class="comments-section" style="display: none;">
                    <div class="comments-list">
                        ${tip.comments.map(comment => `
                            <div class="comment">
                                <img src="${comment.profilePicture || '../assets/default-profile.jpg'}" alt="${comment.userName}">
                                <div class="comment-content">
                                    <span class="comment-author">${comment.userName}</span>
                                    <p>${comment.content}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <form class="comment-form" onsubmit="return addComment('${tip._id}')">
                        <input type="text" placeholder="Add a comment...">
                        <button type="submit">Comment</button>
                    </form>
                </div>
            </div>
        `;
    }

    // Create new travel tip
    async function createTip() {
        try {
            const formData = {
                title: document.getElementById('tipTitle').value,
                content: document.getElementById('tipContent').value,
                category: document.getElementById('tipCategory').value,
                tags: document.getElementById('tipTags').value.split(',').map(tag => tag.trim())
            };

            const response = await fetch(COMMUNITY_URL + '/tips', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            showSuccess('Tip created successfully');
            document.getElementById('createTipForm').reset();
            loadTips();
        } catch (error) {
            handleApiError(error, 'Failed to create tip');
        }
    }

    // Toggle like on a tip
    async function toggleLike(tipId) {
        try {
            const response = await fetch(`${COMMUNITY_URL}/tips/${tipId}/like`, {
                method: 'POST',
                headers: getAuthHeader()
            });

            const data = await handleApiResponse(response);
            loadTips(); // Refresh feed to update likes
        } catch (error) {
            handleApiError(error, 'Failed to like tip');
        }
    }

    // Add comment to a tip
    async function addComment(tipId) {
        try {
            const commentInput = document.querySelector(`.tip-card[data-tip-id="${tipId}"] .comment-form input`);
            const commentContent = commentInput.value.trim();

            if (!commentContent) return false;

            const response = await fetch(`${COMMUNITY_URL}/tips/${tipId}/comment`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ content: commentContent })
            });

            const data = await handleApiResponse(response);
            commentInput.value = '';
            loadTips(); // Refresh feed to update comments
            return false;
        } catch (error) {
            handleApiError(error, 'Failed to add comment');
            return false;
        }
    }

    // Show/hide comments section
    function showComments(tipId) {
        const commentsSection = document.querySelector(`.tip-card[data-tip-id="${tipId}"] .comments-section`);
        commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search
        document.getElementById('tipSearch').addEventListener('input', debounce(searchTips, 300));
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', filterTips);
        
        // Sort by
        document.getElementById('sortBy').addEventListener('change', sortTips);
        
        // Create tip form
        document.getElementById('createTipForm').addEventListener('submit', function(e) {
            e.preventDefault();
            createTip();
        });
    }

    // Search tips with debounce
    function searchTips() {
        const query = document.getElementById('tipSearch').value;
        const category = document.getElementById('categoryFilter').value;
        loadTips({ query, category });
    }

    // Filter tips by category
    function filterTips() {
        const category = this.value;
        const query = document.getElementById('tipSearch').value;
        loadTips({ query, category });
    }

    // Sort tips
    function sortTips() {
        const sortBy = this.value;
        loadTips({ sortBy });
    }

    // Helper functions
    function formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    return {
        initialize
    };
})();

// Initialize community when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    communityManager.initialize();
});
