// utils.mjs

// 🔍 Quick DOM selector
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// 📦 Get data from localStorage
export function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    console.warn(`Invalid JSON in localStorage for key: ${key}`);
    return null;
  }
}

// 💾 Save data to localStorage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// 🔗 Get URL query parameter
export function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 🛒 Update cart badge with animated pulse
export function updateCartBadgeWithAnimation() {
  const badge = qs("#cart-count");
  if (!badge) return;

  const cart = getLocalStorage("so-cart") || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.Quantity || 1), 0);

  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? "inline" : "none";

  // 🔄 Trigger animation
  badge.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
      { transform: "scale(1)" }
    ],
    { duration: 300, easing: "ease-out" }
  );
}

// ⚠️ Show alert (success or error)
export function alertMessage(message, isError = false) {
  const container = qs("#alert-container");
  if (!container) return;

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${isError ? "error" : "success"} show`;
  alertDiv.textContent = message;

  container.appendChild(alertDiv);

  // ⏳ Auto-remove after 3 seconds
  setTimeout(() => {
    alertDiv.classList.remove("show");
    alertDiv.remove();
  }, 3000);
}
