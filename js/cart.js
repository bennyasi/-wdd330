import {
  getLocalStorage,
  setLocalStorage,
  updateCartBadgeWithAnimation
} from "./utils.mjs";

const imageBasePath = "../images/";

// Ensure all image paths are normalized
function fixImagePath(relativePath) {
  if (!relativePath) return "";
  return relativePath.replace(/^(\.\.\/)*images\//, imageBasePath);
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");

  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    updateCartBadgeWithAnimation();
    updateCheckoutButton();
    return;
  }

  const htmlItems = cartItems.map(cartItemTemplate).join("");
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.FinalPrice) * (item.Quantity || 1),
    0
  );

  productList.innerHTML = `
    ${htmlItems}
    <li class="cart-total">Total: $${total.toFixed(2)}</li>
  `;

  updateCartBadgeWithAnimation();
  addRemoveListeners();
  addQuantityListeners();
  updateCheckoutButton();
}

function cartItemTemplate(item) {
  const productLink = `../product_pages/index.html?id=${encodeURIComponent(item.Id)}`;
  const quantity = item.Quantity || 1;
  const itemTotal = (item.FinalPrice * quantity).toFixed(2);
  const colorName = item.Colors?.[0]?.ColorName || "N/A";

  return `
    <li class="cart-card divider">
      <a href="${productLink}" class="cart-card__image">
        <img src="${fixImagePath(item.Image)}" alt="${item.Name}" />
      </a>
      <a href="${productLink}">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${colorName}</p>
      <div class="cart-card__quantity">
        <button class="quantity-btn decrease-qty" data-id="${item.Id}">-</button>
        <span data-qty-id="${item.Id}">qty: ${quantity}</span>
        <button class="quantity-btn increase-qty" data-id="${item.Id}">+</button>
      </div>
      <p class="cart-card__price">$${itemTotal}</p>
      <button class="remove-item" data-id="${item.Id}" aria-label="Remove ${item.Name} from cart">❌</button>
    </li>
  `;
}

function removeFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  const newItems = cartItems.filter(item => item.Id !== productId);

  if (newItems.length !== cartItems.length) {
    setLocalStorage("so-cart", newItems);
    renderCartContents();
  }
}

function updateQuantity(productId, change) {
  let cartItems = getLocalStorage("so-cart") || [];
  const item = cartItems.find(item => item.Id === productId);

  if (item) {
    item.Quantity = (item.Quantity || 1) + change;
    if (item.Quantity <= 0) {
      cartItems = cartItems.filter(i => i.Id !== productId);
    }
    setLocalStorage("so-cart", cartItems);
    renderCartContents();
    animateCartIcon();
  }
}

function addRemoveListeners() {
  const buttons = document.querySelectorAll(".remove-item");
  buttons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = e.target.dataset.id;
      if (confirm("Are you sure you want to remove this item from your cart?")) {
        removeFromCart(productId);
      }
    });
  });
}

function addQuantityListeners() {
  const increaseButtons = document.querySelectorAll(".increase-qty");
  const decreaseButtons = document.querySelectorAll(".decrease-qty");

  increaseButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      updateQuantity(e.target.dataset.id, 1);
    });
  });

  decreaseButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      updateQuantity(e.target.dataset.id, -1);
    });
  });
}

function updateCheckoutButton() {
  const cartItems = getLocalStorage("so-cart") || [];
  const checkoutLink = document.querySelector("#checkout-link");

  if (!checkoutLink) return;

  if (cartItems.length === 0) {
    checkoutLink.style.opacity = "0.5";
    checkoutLink.style.pointerEvents = "none";
    checkoutLink.textContent = "Cart Empty";
  } else {
    checkoutLink.style.opacity = "1";
    checkoutLink.style.pointerEvents = "auto";
    checkoutLink.textContent = "Proceed to Checkout";
  }
}

function animateCartIcon() {
  const cartIcon = document.querySelector("#cart-badge");
  if (cartIcon) {
    cartIcon.classList.add("bounce");
    setTimeout(() => cartIcon.classList.remove("bounce"), 300);
  }
}

// Initialize
renderCartContents();
updateCheckoutButton();
