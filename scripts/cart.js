// cart.js — runs only on the cart page

document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cart-container");
  const totalPriceEl = document.getElementById("total-price");
  const clearCartBtn = document.getElementById("clear-cart");

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
        return;
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
    await window.cartManager.clearCart();
    renderCart();
  });

  // Re-render when updated
  window.addEventListener("cartUpdated", renderCart);

  // Initial render
  renderCart();
});
