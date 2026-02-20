const searchInput = document.querySelector(".search-box");
const searchContainer = document.querySelector(".search-container");

// Create dynamic dropdown container
const searchResults = document.createElement("div");
searchResults.classList.add("search-results");
searchContainer.appendChild(searchResults);

let products = [];

// Load product data from API
fetch("/api/products")
  .then(res => res.json())
  .then(data => { products = data })
  .catch(err => console.error("Error loading products:", err));

// Search input logic
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = "";

  if (query === "") {
    searchResults.style.display = "none";
    return;
  }

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    searchResults.innerHTML = "<div class='no-result'>No products found</div>";
  } else {
    filtered.forEach((product) => {
      const item = document.createElement("div");
      item.classList.add("result-item");
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="result-img">
        <div class="result-info">
          <span class="result-name">${product.name}</span>
          <span class="result-price">₹${product.price}</span>
        </div>
      `;

      // Redirect to product page on click
      item.addEventListener("click", () => {
        window.location.href = `/product/${product.id}`;
      });

      searchResults.appendChild(item);
    });
  }

  searchResults.style.display = "block";
});

// Hide dropdown when clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) {
    searchResults.style.display = "none";
  }
});
