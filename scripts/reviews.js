// Reviews functionality for product page

let currentProductId = null;

// Initialize reviews when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProductId = urlParams.get('id');
    
    if (currentProductId) {
        loadProductReviews(currentProductId);
    }
});

// Load product reviews
async function loadProductReviews(productId) {
    try {
        const response = await fetch(`/api/reviews/product/${productId}`);
        const data = await response.json();
        
        // Display average rating
        displayAverageRating(data.avgRating, data.totalReviews);
        
        // Display rating distribution
        displayRatingDistribution(data.ratingDistribution, data.totalReviews);
        
        // Display all reviews
        displayReviews(data.reviews);
        
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Display average rating
function displayAverageRating(avgRating, totalReviews) {
    const avgRatingElement = document.getElementById('avg-rating');
    const avgRatingStars = document.getElementById('avg-rating-stars');
    const totalReviewsElement = document.getElementById('total-reviews');
    
    if (avgRatingElement) {
        avgRatingElement.textContent = avgRating.toFixed(1);
    }
    
    if (avgRatingStars) {
        avgRatingStars.textContent = getStarDisplay(avgRating);
    }
    
    if (totalReviewsElement) {
        totalReviewsElement.textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
    }
}

// Display rating distribution bars
function displayRatingDistribution(distribution, totalReviews) {
    const container = document.getElementById('rating-distribution');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create bars for each rating (5 to 1)
    for (let rating = 5; rating >= 1; rating--) {
        const ratingData = distribution.find(d => d.rating == rating);
        const count = ratingData ? ratingData.count : 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        const barHTML = `
            <div class="rating-bar">
                <span class="rating-label">${rating} ⭐</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-count">${count}</span>
            </div>
        `;
        
        container.innerHTML += barHTML;
    }
}

// Display all reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewHTML = `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">
                        <strong>${review.user_name}</strong>
                        <span class="review-date">${review.formatted_date}</span>
                    </div>
                    <div class="review-rating">${getStarDisplay(review.rating)}</div>
                </div>
                <div class="review-text">${review.review_text || 'No comment provided.'}</div>
            </div>
        `;
        
        container.innerHTML += reviewHTML;
    });
}

// Submit a new review
async function submitReview() {
    const rating = document.getElementById('review-rating').value;
    const reviewText = document.getElementById('review-text').value;
    
    if (!reviewText.trim()) {
        alert('Please write a review before submitting.');
        return;
    }
    
    // Get user ID from session (you'll need to implement this based on your auth system)
    const userId = getUserIdFromSession();
    
    if (!userId) {
        alert('Please login to submit a review.');
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = await fetch('/api/reviews/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                productId: currentProductId,
                rating: parseInt(rating),
                reviewText: reviewText
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Review submitted successfully!');
            // Clear form
            document.getElementById('review-text').value = '';
            document.getElementById('review-rating').value = '5';
            // Reload reviews
            loadProductReviews(currentProductId);
        } else {
            alert('Failed to submit review. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
}

// Helper function to get star display
function getStarDisplay(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + 
           (hasHalfStar ? '⭐' : '') + 
           '☆'.repeat(emptyStars);
}

// Helper function to get user ID from session
function getUserIdFromSession() {
    // This is a placeholder - implement based on your auth system
    // You might store user ID in localStorage, sessionStorage, or get it from a cookie
    // For now, returning a test user ID
    return 1; // Replace with actual session management
}
