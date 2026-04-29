// Dashboard functionality

// Load dashboard data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

// Main function to load all dashboard data
async function loadDashboard() {
    const userId = getUserIdFromSession();
    
    if (!userId) {
        window.location.href = '/login';
        return;
    }
    
    try {
        // Load dashboard stats
        await loadDashboardStats(userId);
        
        // Load recent orders
        await loadRecentOrders(userId);
        
        // Load user reviews
        await loadUserReviews(userId);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load dashboard statistics
async function loadDashboardStats(userId) {
    try {
        const response = await fetch(`/api/analytics/user-dashboard/${userId}`);
        const data = await response.json();
        
        // Update total spending
        document.getElementById('total-spending').textContent = 
            `₹${data.totalSpending.toFixed(2)}`;
        
        // Update total orders
        document.getElementById('total-orders').textContent = 
            data.orderSummary.total_orders || 0;
        
        // Update last order date
        if (data.orderSummary.last_order_date) {
            const lastOrderDate = new Date(data.orderSummary.last_order_date);
            document.getElementById('last-order-date').textContent = 
                lastOrderDate.toLocaleDateString();
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent orders
async function loadRecentOrders(userId) {
    try {
        const response = await fetch(`/api/orders/user/${userId}`);
        const orders = await response.json();
        
        const container = document.getElementById('recent-orders');
        container.innerHTML = '';
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="no-data">No orders yet. Start shopping!</p>';
            return;
        }
        
        // Show only first 5 orders
        const recentOrders = orders.slice(0, 5);
        
        recentOrders.forEach(order => {
            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p class="order-date">
                            <strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}
                        </p>
                        <p class="order-items">
                            <strong>Items:</strong> ${order.item_count} item(s)
                        </p>
                        <p class="order-products">
                            <strong>Products:</strong> ${order.product_names || 'N/A'}
                        </p>
                    </div>
                    <div class="order-footer">
                        <span class="order-total">₹${order.total_amount}</span>
                        <button onclick="viewOrderDetails(${order.id})" class="btn-view-order">
                            View Details
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += orderCard;
        });
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recent-orders').innerHTML = 
            '<p class="error">Failed to load orders</p>';
    }
}

// Load user reviews
async function loadUserReviews(userId) {
    try {
        const response = await fetch(`/api/reviews/user/${userId}`);
        const reviews = await response.json();
        
        // Update reviews count
        document.getElementById('total-reviews').textContent = reviews.length;
        
        const container = document.getElementById('my-reviews');
        container.innerHTML = '';
        
        if (reviews.length === 0) {
            container.innerHTML = '<p class="no-data">No reviews yet. Share your experience!</p>';
            return;
        }
        
        // Show only first 3 reviews
        const recentReviews = reviews.slice(0, 3);
        
        recentReviews.forEach(review => {
            const reviewCard = `
                <div class="review-card">
                    <div class="review-product">
                        <img src="${review.image_url}" alt="${review.product_name}">
                        <div class="review-product-info">
                            <h4>${review.product_name}</h4>
                            <div class="review-rating">${getStarDisplay(review.rating)}</div>
                        </div>
                    </div>
                    <p class="review-text">${review.review_text || 'No comment'}</p>
                    <p class="review-date">${review.formatted_date}</p>
                </div>
            `;
            container.innerHTML += reviewCard;
        });
        
    } catch (error) {
        console.error('Error loading user reviews:', error);
        document.getElementById('my-reviews').innerHTML = 
            '<p class="error">Failed to load reviews</p>';
    }
}

// View order details
function viewOrderDetails(orderId) {
    window.location.href = `/order-details?id=${orderId}`;
}

// Helper function to get star display
function getStarDisplay(rating) {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
}

// Helper function to get user ID from session
function getUserIdFromSession() {
    // Placeholder - implement based on your auth system
    return 1; // Replace with actual session management
}
