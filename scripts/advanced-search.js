// Advanced Search functionality for shop page

// Apply filters and search
async function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const inStock = document.getElementById('in-stock-filter').checked;
    const sortBy = document.getElementById('sort-by').value;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (inStock) params.append('inStock', 'true');
    if (sortBy) params.append('sortBy', sortBy);
    
    try {
        // Show loading state
        const container = document.getElementById('product-container');
        container.innerHTML = '<div class="loading">Searching products...</div>';
        
        // Fetch filtered products
        const response = await fetch(`/api/analytics/search?${params.toString()}`);
        const products = await response.json();
        
        // Display products
        displayFilteredProducts(products);
        
        // Update product count
        updateProductCount(products.length);
        
    } catch (error) {
        console.error('Error applying filters:', error);
        document.getElementById('product-container').innerHTML = 
            '<div class="error">Failed to load products. Please try again.</div>';
    }
}

// Display filtered products
function displayFilteredProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <p>No products found matching your criteria.</p>
                <button onclick="clearFilters()" class="btn-primary">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Create product card HTML
function createProductCard(product) {
    const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const avgRating = product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0.0';
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}">
                <span class="stock-badge ${stockClass}">${stockStatus}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category_name}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="rating-stars">${getStarDisplay(avgRating)}</span>
                    <span class="rating-value">${avgRating}</span>
                </div>
                <p class="product-price">₹${product.price}</p>
                <div class="product-actions">
                    <button onclick="viewProduct(${product.id})" class="btn-view">View Details</button>
                    ${product.stock > 0 ? 
                        `<button onclick="addToCartQuick(${product.id}, '${product.name}', ${product.price}, '${product.image_url}')" class="btn-cart">Add to Cart</button>` :
                        `<button class="btn-disabled" disabled>Out of Stock</button>`
                    }
                </div>
            </div>
        </div>
    `;
}

// Update product count display
function updateProductCount(count) {
    const countElement = document.getElementById('products-count');
    if (countElement) {
        countElement.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

// Clear all filters
function clearFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('in-stock-filter').checked = false;
    document.getElementById('sort-by').value = '';
    
    // Reload all products
    applyFilters();
}

// View product details
function viewProduct(productId) {
    window.location.href = `/product?id=${productId}`;
}

// Quick add to cart
function addToCartQuick(productId, productName, productPrice, productImage) {
    // Use existing cart manager if available
    if (typeof CartManager !== 'undefined') {
        CartManager.addItem({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
        alert(`${productName} added to cart!`);
    } else {
        console.error('CartManager not found');
    }
}

// Helper function to display stars
function getStarDisplay(rating) {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + 
           (hasHalfStar ? '⭐' : '') + 
           '☆'.repeat(emptyStars);
}

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    applyFilters(); // Load all products initially
});
