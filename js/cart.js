import { getLocalStorage, setLocalStorage, updateCartBadgeWithAnimation } from "./utils.mjs";

const imageBasePath = "../images/";

function fixImagePath(relativePath) {
  if (!relativePath) return "";
  if (relativePath.startsWith("images/")) {
    return imageBasePath + relativePath.replace(/^images\//, "");
  }
  return imageBasePath + relativePath.replace(/^(\.\.\/)+images\//, "");
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");

  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    updateCartBadgeWithAnimation();
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
  return `
    <li class="cart-card divider">
      <a href="${productLink}" class="cart-card__image">
        <img src="${fixImagePath(item.Image)}" alt="${item.Name}" />
      </a>
      <a href="${productLink}">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors?.[0]?.ColorName || "N/A"}</p>
      <div class="cart-card__quantity">
        <button class="quantity-btn decrease-qty" data-id="${item.Id}">-</button>
        <span>qty: ${item.Quantity || 1}</span>
        <button class="quantity-btn increase-qty" data-id="${item.Id}">+</button>
      </div>
      <p class="cart-card__price">$${(item.FinalPrice * (item.Quantity || 1)).toFixed(2)}</p>
      <button class="remove-item" data-id="${item.Id}" aria-label="Remove ${item.Name} from cart">❌</button>
    </li>
  `;
}

function removeFromCart(productId) {
  let cartItems = getLocalStorage("so-cart") || [];
  cartItems = cartItems.filter(item => item.Id !== productId);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function addRemoveListeners() {
  const removeButtons = document.querySelectorAll(".remove-item");
  removeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = e.target.dataset.id;
      if (confirm("Are you sure you want to remove this item from your cart?")) {
        removeFromCart(productId);
      }
    });
  });
}

function updateQuantity(productId, change) {
  let cartItems = getLocalStorage("so-cart") || [];
  const itemIndex = cartItems.findIndex(item => item.Id === productId);
  if (itemIndex !== -1) {
    cartItems[itemIndex].Quantity = (cartItems[itemIndex].Quantity || 1) + change;
    if (cartItems[itemIndex].Quantity <= 0) {
      cartItems.splice(itemIndex, 1);
    }
    setLocalStorage("so-cart", cartItems);
    renderCartContents();

    // Animate the cart icon whenever quantity changes
    animateCartIcon();
  }
}

function addQuantityListeners() {
  const increaseButtons = document.querySelectorAll(".increase-qty");
  const decreaseButtons = document.querySelectorAll(".decrease-qty");

  increaseButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = e.target.dataset.id;
      updateQuantity(productId, 1);
    });
  });

  decreaseButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = e.target.dataset.id;
      updateQuantity(productId, -1);
    });
  });
}

function updateCheckoutButton() {
  const cartItems = getLocalStorage("so-cart") || [];
  const checkoutLink = document.querySelector("#checkout-link");

  if (checkoutLink) {
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
}

// Animate the cart badge
function animateCartIcon() {
  const cartIcon = document.querySelector("#cart-badge");
  if (cartIcon) {
    cartIcon.classList.add("bounce");
    setTimeout(() => cartIcon.classList.remove("bounce"), 300);
  }
}

// Initialize cart rendering
renderCartContents();
updateCheckoutButton();
