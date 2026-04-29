// cart.js — runs only on the cart page

document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cart-container");
  const totalPriceEl = document.getElementById("total-price");
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  // If the page doesn't have a cart container, stop execution completely
  if (!cartContainer) {
    console.log("cart.js: Not on cart page, skipping script.");
    return;
  }

  async function renderCart() {
    if (!window.cartManager) {
      console.error("cart.js: cartManager not loaded");
      return;
    }

    cartContainer.innerHTML = "<p>Loading cart...</p>";

    try {
      const items = await window.cartManager.getItems();
      if (!items || items.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalPriceEl.textContent = "Total: ₹0";
        // Disable checkout button if cart is empty
        if (checkoutBtn) {
          checkoutBtn.disabled = true;
          checkoutBtn.textContent = "Cart is Empty";
        }
        return;
      }

      // Enable checkout button
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Checkout & Place Order";
      }

      cartContainer.innerHTML = "";
      let total = 0;

      items.forEach((item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        total += price * qty;

        const el = document.createElement("div");
        el.classList.add("cart-item");
        el.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-img">
          <div class="cart-details">
            <h3>${item.name}</h3>
            <p>Price: ₹${price}</p>
            <p>Quantity: ${qty}</p>
            <p>Subtotal: ₹${(price * qty).toFixed(2)}</p>
          </div>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        `;
        cartContainer.appendChild(el);
      });

      totalPriceEl.textContent = `Total: ₹${total.toFixed(2)}`;
    } catch (err) {
      console.error("cart.js: error rendering cart", err);
      cartContainer.innerHTML = "<p>Error loading cart.</p>";
    }
  }

  // Remove an item
  cartContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    await window.cartManager.removeFromCart(id);
    renderCart();
  });

  // Clear cart
  clearCartBtn?.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await window.cartManager.clearCart();
      renderCart();
    }
  });

  // Checkout - Place orders in database
  checkoutBtn?.addEventListener("click", async () => {
    try {
      const items = await window.cartManager.getItems();
      
      if (!items || items.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      // Get user ID (for now using test user ID 1)
      // TODO: Replace with actual logged-in user ID from session
      const userId = getUserId();
      
      if (!userId) {
        alert("Please login to place an order.");
        window.location.href = "/login";
        return;
      }

      // Disable button during processing
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Processing...";

      // Place order for each item using the stored procedure
      const orderPromises = items.map(item => 
        placeOrder(userId, item.id, item.quantity)
      );

      const results = await Promise.all(orderPromises);
      
      // Check if all orders succeeded
      const allSuccess = results.every(r => r.success);
      
      if (allSuccess) {
        alert(`Order placed successfully! ${results.length} item(s) ordered.`);
        // Clear cart after successful checkout
        await window.cartManager.clearCart();
        renderCart();
        // Optionally redirect to order confirmation page
        // window.location.href = "/orders";
      } else {
        const failedItems = results.filter(r => !r.success);
        alert(`Some items could not be ordered:\n${failedItems.map(r => r.message).join('\n')}`);
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Checkout & Place Order";
      }
      
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order. Please try again.");
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Checkout & Place Order";
    }
  });

  // Helper function to place a single order using stored procedure
  async function placeOrder(userId, productId, quantity) {
    try {
      const response = await fetch('/api/orders/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: quantity
        })
      });

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error placing order:', error);
      return {
        success: false,
        message: `Failed to order product ${productId}`
      };
    }
  }

  // Helper function to get user ID
  function getUserId() {
    // TODO: Implement proper session management
    // For now, returning test user ID
    // You can store user ID in localStorage after login
    return localStorage.getItem('userId') || 1;
  }

  // Re-render when updated
  window.addEventListener("cartUpdated", renderCart);

  // Initial render
  renderCart();
});
