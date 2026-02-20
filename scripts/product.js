// Get product ID from query (?id=) or path (/product/:id)
const urlParams = new URLSearchParams(window.location.search);
let productId = parseInt(urlParams.get("id"), 10);

if (!productId) {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const maybe = Number(last);
  if (!Number.isNaN(maybe)) productId = maybe;
}

const productContainer =
  document.getElementById("product-details") ||
  document.getElementById("product-detail");

if (!productContainer) {
  console.error("Product container not found in DOM");
} else if (!productId) {
  productContainer.innerHTML = `<p style="text-align:center; font-size:1.2rem;">Product not found!</p>`;
} else {
  fetch(`/api/products/${productId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then((product) => {
      const {
        _id = productId,
        name = "Unnamed Product",
        category = "Uncategorized",
        price,
        description = "No description available.",
        image = "placeholder.jpg",
        rating = 4.5,
        reviews = Math.floor(Math.random() * 50 + 20),
        stock = 10,
      } = product;

      const imageSrc = (image || "").replace(/^\.\//, "/");
      const stars =
        "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

      productContainer.innerHTML = `
        <div class="product-page">
          <img src="${imageSrc}" alt="${name}" class="product-detail-img" />

          <div class="product-info">
            <div>
              <h1>${name}</h1>
              <p class="product-category">${category}</p>

              <div class="product-rating">${stars} (${reviews} Reviews)</div>
              <div class="product-price">₹${price ?? "N/A"}</div>

              <p class="stock-status" style="color:${
                stock > 0 ? "#2e8b57" : "red"
              };">
                ${stock > 0 ? "In Stock" : "Out of Stock"}
              </p>

              <p class="product-description">${description}</p>
            </div>

            <!-- Quantity Selector -->
            <div class="quantity-selector">
              <button class="quantity-btn" id="decrease">-</button>
              <span class="quantity-number" id="quantity">1</span>
              <button class="quantity-btn" id="increase">+</button>
            </div>

            <button id="add-to-cart" ${stock === 0 ? "disabled" : ""}>
              ${stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      `;

      // --- Quantity logic ---
      let quantity = 1;
      const quantityDisplay = document.getElementById("quantity");

      document.getElementById("increase").addEventListener("click", () => {
        if (quantity < stock) {
          quantity++;
          quantityDisplay.textContent = quantity;
        }
      });

      document.getElementById("decrease").addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          quantityDisplay.textContent = quantity;
        }
      });

      // --- Add to Cart logic (FIXED) ---
      const addToCartBtn = document.getElementById("add-to-cart");
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", async () => {
          if (!window.cartManager) {
            console.error("Cart manager not initialized");
            return;
          }

          //  Extract the correct fields
          const cartProduct = {
            id: _id, // required for backend
            name,
            price,
            image: imageSrc,
          };

          try {
            await window.cartManager.addToCart(cartProduct, quantity);
            alert(`${quantity} × ${name} added to cart successfully!`);
          } catch (err) {
            console.error("Error adding to cart:", err);
            alert(" Failed to add to cart. Please try again.");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error loading product:", error);
      productContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load product details.</p>`;
    });
}
