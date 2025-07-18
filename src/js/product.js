import { getLocalStorage, setLocalStorage, qs, getParam, alertMessage, updateCartBadgeWithAnimation } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const productId = getParam("id");
const dataSource = new ProductData();

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
}

async function addToCartHandler(e) {
  try {
    const id = e.target.dataset.id;
    console.log("Attempting to add product to cart with ID:", id);
    
    const product = await dataSource.findProductById(id);
    console.log("Product found:", product);
    
    if (product) {
      addProductToCart(product);
      alertMessage(`${product.Name} has been added to your cart!`, false, 'success');
    } else {
      alertMessage("Product not found.", true);
      console.error("Product not found for ID:", id);
    }
  } catch (error) {
    console.error("Error in addToCartHandler:", error);
    alertMessage("An error occurred while adding the product to cart.", true);
  }
}

async function displayProductDetails() {
  if (!productId) {
    console.log("No product ID found in URL");
    return;
  }

  console.log("Loading product details for ID:", productId);
  
  try {
    const product = await dataSource.findProductById(productId);
    const detailContainer = document.querySelector(".product-detail");
    if (!detailContainer) {
      console.error("Product detail container not found");
      return;
    }

    if (!product) {
      detailContainer.innerHTML = "<p>Product not found.</p>";
      console.error("Product not found for ID:", productId);
      return;
    }

    console.log("Product loaded successfully:", product);

    // Use responsive images based on screen size
    const primaryLarge = product.Images?.PrimaryLarge || "";
    const primaryMedium = product.Images?.PrimaryMedium || "";
    const fallbackImage = product.Image || primaryMedium || primaryLarge;

    // Calculate discount information
    const suggestedPrice = product.SuggestedRetailPrice || product.ListPrice || product.FinalPrice;
    const finalPrice = product.FinalPrice;
    const listPrice = product.ListPrice || suggestedPrice;
    
    const hasDiscount = suggestedPrice > finalPrice || listPrice > finalPrice;
    const discountAmount = hasDiscount ? Math.max(suggestedPrice - finalPrice, listPrice - finalPrice) : 0;
    const discountPercentage = hasDiscount ? Math.round((discountAmount / Math.max(suggestedPrice, listPrice)) * 100) : 0;

    // Generate discount flag HTML
    const discountFlag = hasDiscount 
      ? `<div class="discount-flag">Save $${discountAmount.toFixed(2)} (${discountPercentage}% off!)</div>` 
      : '';

    // Generate price HTML
    const priceHTML = hasDiscount 
      ? `<div class="price-container">
           ${suggestedPrice !== finalPrice ? `<span class="original-price">MSRP: $${suggestedPrice.toFixed(2)}</span>` : ''}
           ${listPrice !== finalPrice && listPrice !== suggestedPrice ? `<span class="original-price">List: $${listPrice.toFixed(2)}</span>` : ''}
           <span class="final-price">$${finalPrice.toFixed(2)}</span>
         </div>`
      : `<div class="price-container no-discount">
           <span class="final-price">$${finalPrice.toFixed(2)}</span>
         </div>`;

    detailContainer.innerHTML = `
      <h3>${product.Brand?.Name || ""}</h3>
      <h2>${product.Name}</h2>
      <picture>
        <source media="(min-width: 1200px)" srcset="${primaryLarge || fallbackImage}">
        <source media="(min-width: 769px)" srcset="${primaryMedium || fallbackImage}">
        <img src="${primaryMedium || fallbackImage}" alt="${product.Name}" class="responsive-image">
      </picture>
      ${discountFlag}
      ${priceHTML}
      <p class="description">${product.DescriptionHtmlSimple || ""}</p>
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    `;

    const addToCartBtn = qs("#addToCart");
    if (addToCartBtn) {
      addToCartBtn.removeEventListener("click", addToCartHandler);
      addToCartBtn.addEventListener("click", addToCartHandler);
      console.log("Add to cart button event listener attached");
    } else {
      console.error("Add to cart button not found");
    }
  } catch (error) {
    console.error("Error loading product details:", error);
    const detailContainer = document.querySelector(".product-detail");
    if (detailContainer) {
      detailContainer.innerHTML = "<p>Error loading product details.</p>";
    }
  }
}

function updateCartBadge() {
  const cart = getLocalStorage("so-cart") || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.Quantity || 1), 0);
  const badge = document.querySelector("#cart-count");
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? "inline" : "none";
  }
}

// Initialize
displayProductDetails();
updateCartBadge();