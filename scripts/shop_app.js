// ThriftStore - Unified with Express Session Cart

// Base class
class ThriftItem {
  constructor(id, name, price, category, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.image = image;
  }

  displayItem() {
    return `
      <div class="product-card" data-id="${this.id}">
        <div class="product-image">
          <img src="${this.image}" alt="${this.name}">
        </div>
        <div class="product-info">
          <h3 class="product-title">${this.name}</h3>
          <p class="product-price"><span class="currency">Rs</span> ${this.price}</p>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
    `;
  }
}

// Subclass for featured items
class FeaturedItem extends ThriftItem {
  constructor(id, name, price, category, image) {
    super(id, name, price, category, image);
  }

  displayItem() {
    return `
      <div class="product-card featured" data-id="${this.id}">
        <div class="product-image">
          <img src="${this.image}" alt="${this.name}">
        </div>
        <div class="product-info">
          <h3 class="product-title">${this.name} <span class="badge">Featured</span></h3>
          <p class="product-price"><span class="currency">Rs</span> ${this.price}</p>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
    `;
  }
}

// Fetch products from API and render them
fetch("/api/products")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("product-container");
    if (!container) return;

    container.innerHTML = ""; // Clear old items

    data.forEach(item => {
      const rawImage = item.image || "";
      let imgPath = rawImage.replace(/^\.\//, "/");
      imgPath = encodeURI(imgPath);

      const product =
        item.type === "featured"
          ? new FeaturedItem(item.id, item.name, item.price, item.category, imgPath)
          : new ThriftItem(item.id, item.name, item.price, item.category, imgPath);

      container.innerHTML += product.displayItem();
    });

    // Fix image paths (if relative)
    container.querySelectorAll(".product-image img").forEach(img => {
      const s = img.getAttribute("src") || "";
      if (s.startsWith("./")) img.src = s.replace(/^\.\//, "/");
    });
  })
  .catch(err => console.error("Error loading products:", err));

// Event delegation for dynamic elements
document.addEventListener("click", async (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const productId = card.getAttribute("data-id");
  const name = card.querySelector(".product-title").innerText;
  const priceText = card.querySelector(".product-price").innerText;
  const image = card.querySelector("img").src;

  // 🧠 Normalize price (remove Rs and spaces)
  const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

  // --- Handle Add to Cart ---
  if (e.target.classList.contains("add-to-cart")) {
    const productData = {
      productId,
      productName: name,
      productPrice: price,
      productImage: image,
      quantity: 1,
    };

    try {
      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // 👈 important for session
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        alert(`${name} added to cart successfully!`);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert("❌ Failed to add item to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("⚠️ Could not contact server.");
    }

    return; // stop here (no redirect)
  }

  // --- Redirect to product details page ---
  if (!e.target.classList.contains("add-to-cart")) {
    window.location.href = `/product/${productId}`;
  }
});
