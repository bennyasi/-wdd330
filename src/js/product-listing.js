// Example static product data (replace with fetch from JSON or API as needed)
const products = [
  {
    Id: "t1",
    Name: "Marmot Ajax Tent",
    Image: "../images/tents/marmot-ajax-tent.jpg",
    FinalPrice: 199.99
  },
  {
    Id: "t2",
    Name: "Mountain Ultra Tent",
    Image: "../images/tents/mountain-ultra-tent.jpg",
    FinalPrice: 159.95
  }
];

function getCart() {
  return JSON.parse(localStorage.getItem("so-cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("so-cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const product = products.find((p) => p.Id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.Id === product.Id);
  
  if (existing) {
    existing.Quantity = (existing.Quantity || 1) + 1;
  } else {
    cart.push({ ...product, Quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(`${product.Name} added to cart!`);
}

function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.Quantity || 1), 0);
  const countElement = document.getElementById("cart-count");
  countElement.textContent = totalCount;
  countElement.style.display = totalCount > 0 ? "inline" : "none";
}

function renderProducts() {
  const container = document.querySelector(".product-list");

  container.innerHTML = products.map(product => `
    <li class="product-card">
      <img src="${product.Image}" alt="${product.Name}" />
      <h3>${product.Name}</h3>
      <p>$${product.FinalPrice.toFixed(2)}</p>
      <button class="add-to-cart-btn" data-id="${product.Id}">Add to Cart</button>
    </li>
  `).join("");

  // Add click listeners
  document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;
      addToCart(productId);
    });
  });
}

renderProducts();
updateCartCount();
