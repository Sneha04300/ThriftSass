const express = require('express');
const router = express.Router();

/* ---------- PAGES ---------- */

router.get('/', (req, res) => {
  res.render('home', { pageTitle: 'Home', active: 'home' });
});

router.get('/shop', (req, res) => {
  // render your shop grid; products should be available as `products`
  // If you already fetch them elsewhere, keep that logic. Here we just render.
  res.render('shop', { pageTitle: 'Shop All', active: 'shop' });
});

router.get('/product', (req, res) => {
  res.render('product', { pageTitle: 'Product', active: '' });
});

router.get('/product/:id', (req, res) => {
  res.render('product', { pageTitle: 'Product', active: '' });
});

router.get('/ai-style', (req, res) => {
  res.render('ai-style', { pageTitle: 'AI Stylist', active: 'ai' });
});

/* ---------- AUTH PAGES ---------- */

// Login page
router.get('/login', (req, res) => {
  res.render('login', { pageTitle: 'Login', active: '' });
});

// Signup page
router.get('/signup', (req, res) => {
  res.render('signup', { pageTitle: 'Signup', active: '' });
});


/* ---------- CART API (SESSION-BASED) ---------- */

// return cart as JSON (used by cart.js)
router.get('/cart/json', (req, res) => {
  res.json({ cartItems: req.session.cart || [] });
});

// add item to cart from fetch()
router.post('/cart/add', (req, res) => {
  const { productId, productName, productPrice, productImage, quantity } = req.body;

  if (!req.session.cart) req.session.cart = [];

  const id = String(productId);
  const price = Number.parseFloat(
    (productPrice ?? '').toString().replace(/[^\d.]/g, '')
  ) || 0;
  const qty = Number.parseInt(quantity, 10) || 1;

  const existing = req.session.cart.find(i => String(i.id) === id);
  if (existing) {
    existing.quantity += qty;
  } else {
    req.session.cart.push({
      id,
      name: productName,
      price,
      image: productImage,
      quantity: qty,
    });
  }

  return res.json({ success: true, message: 'Item added to cart!' });
});

// remove one item
router.post('/cart/remove', (req, res) => {
  const { productId } = req.body;
  if (req.session.cart) {
    const id = String(productId);
    req.session.cart = req.session.cart.filter(i => String(i.id) !== id);
  }
  return res.json({ success: true, message: 'Item removed from cart!' });
});

// clear all items
router.post('/cart/clear', (req, res) => {
  req.session.cart = [];
  return res.json({ success: true, message: 'Cart cleared!' });
});

/* ---------- CART PAGE (SERVER-RENDERED) ---------- */

router.get('/cart', (req, res) => {
  const cartItems = req.session.cart || [];
  const total = cartItems.reduce((sum, i) => sum + (Number(i.price) * (i.quantity || 1)), 0);
  res.render('cart', {
    pageTitle: 'Cart',
    active: 'cart',
    cartItems,
    totalPrice: total.toFixed(2),
  });
});

module.exports = router;
