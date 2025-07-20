import {
  getLocalStorage,
  setLocalStorage,
  qs,
  getParam,
  alertMessage,
  updateCartBadgeWithAnimation,
} from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const productId = getParam("id");
const dataSource = new ProductData();
let isAddingToCart = false;

function addProductToCart(product) {
  let cart = getLocalStorage("so-cart") || [];
  const existingIndex = cart.findIndex((item) => item.Id === product.Id);
  if (existingIndex !== -1) {
    cart[existingIndex].Quantity = (cart[existingIndex].Quantity || 1) + 1;
  } else {
    cart.push({ ...product, Quantity: 1 });
  }
  setLocalStorage("so-cart", cart);
  updateCartBadgeWithAnimation();
  animateCartIcon(); // 🔄 Add bounce effect
}

function animateCartIcon() {
  const badge = document.querySelector("#cart-count");
  if (badge) {
    badge.classList.add("bounce");
    setTimeout(() => badge.classList.remove("bounce"), 300);
  }
}

async function addToCartHandler(e) {
  if (isAddingToCart) return;
  isAddingToCart = true;

  try {
    const id = e.target.dataset.id;
    if (!id) throw new Error("Product ID missing on button");

    const product = await dataSource.findProductById(id);
    if (!product) {
      alertMessage("Product not found.", true);
      return;
    }

    addProductToCart(product);
    alertMessage(`${product.Name} has been added to your cart!`);
  } catch (error) {
    console.error(error);
    alertMessage("An error occurred while adding the product to cart.", true);
  } finally {
    setTimeout(() => {
      isAddingToCart = false;
    }, 500);
  }
}

async function displayProductDetails() {
  const detailContainer = qs(".product-detail");

  if (!productId) {
    detailContainer.innerHTML = "<p>Product ID not specified in URL.</p>";
    return;
  }

  detailContainer.innerHTML = "<p>Loading product details...</p>";

  try {
    const product = await dataSource.findProductById(productId);
    if (!product) {
      detailContainer.innerHTML = "<p>Product not found.</p>";
      return;
    }

    const primaryLarge = product.Images?.PrimaryLarge || "";
    const primaryMedium = product.Images?.PrimaryMedium || "";
    const fallbackImage = primaryMedium || primaryLarge || "";

    const suggestedPrice = product.SuggestedRetailPrice || product.ListPrice || product.FinalPrice;
    const finalPrice = product.FinalPrice;
    const listPrice = product.ListPrice || suggestedPrice;

    const hasDiscount = suggestedPrice > finalPrice || listPrice > finalPrice;
    const discountAmount = hasDiscount ? Math.max(suggestedPrice - finalPrice, listPrice - finalPrice) : 0;
    const discountPercentage = hasDiscount
      ? Math.round((discountAmount / Math.max(suggestedPrice, listPrice)) * 100)
      : 0;

    const discountFlag = hasDiscount
      ? `<div class="discount-flag">Save $${discountAmount.toFixed(2)} (${discountPercentage}% off!)</div>`
      : "";

    const priceHTML = hasDiscount
      ? `<div class="price-container">
          ${suggestedPrice !== finalPrice ? `<span class="original-price">MSRP: $${suggestedPrice.toFixed(2)}</span>` : ""}
          ${listPrice !== finalPrice && listPrice !== suggestedPrice ? `<span class="original-price">List: $${listPrice.toFixed(2)}</span>` : ""}
          <span class="final-price">$${finalPrice.toFixed(2)}</span>
        </div>`
      : `<div class="price-container no-discount">
          <span class="final-price">$${finalPrice.toFixed(2)}</span>
        </div>`;

    detailContainer.innerHTML = `
      <h3>${product.Brand?.Name || ""}</h3>
      <h2>${product.Name}</h2>
      <picture>
        <source media="(min-width: 1200px)" srcset="${primaryLarge}">
        <source media="(min-width: 769px)" srcset="${primaryMedium}">
        <img src="${fallbackImage}" alt="${product.Name}" class="responsive-image" />
      </picture>
      ${discountFlag}
      ${priceHTML}
      <p class="description">${product.DescriptionHtmlSimple || ""}</p>
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    `;

    const addToCartBtn = qs("#addToCart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", addToCartHandler);
    }
  } catch (error) {
    console.error("Error loading product details:", error);
    detailContainer.innerHTML = "<p>Error loading product details.</p>";
  }
}

function updateCartBadge() {
  const cart = getLocalStorage("so-cart") || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.Quantity || 1), 0);
  const badge = qs("#cart-count");
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? "inline" : "none";
  }
}

// Initialize
displayProductDetails();
updateCartBadge();
