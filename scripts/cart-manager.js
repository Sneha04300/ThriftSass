// cart-manager.js — Session-backed cart manager

class CartManager {
  constructor() {
    this.base = '/cart';
  }

  async addToCart(product, quantity = 1) {
    const res = await fetch(`${this.base}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // Important for session cookies
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        quantity
      })
    });

    const data = await res.json().catch(() => ({}));
    if (data?.success) {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return true;
    }
    throw new Error('Add to cart failed');
  }

  async getItems() {
    const res = await fetch(`${this.base}/json`, {
      credentials: 'same-origin' // Important for session cookies
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({ cartItems: [] }));
    return data.cartItems || [];
  }

  async removeFromCart(productId) {
    const res = await fetch(`${this.base}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // Important for session cookies
      body: JSON.stringify({ productId })
    });
    const data = await res.json().catch(() => ({}));
    if (data?.success !== false) {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async clearCart() {
    const res = await fetch(`${this.base}/clear`, {
      method: 'POST',
      credentials: 'same-origin' // Important for session cookies
    });
    const data = await res.json().catch(() => ({}));
    if (data?.success !== false) {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }
}

window.cartManager = new CartManager();
