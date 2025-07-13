// utils.mjs

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Update cart badge with animation
export function updateCartBadgeWithAnimation() {
  const badge = qs("#cart-count");
  if (!badge) return;
  const cart = getLocalStorage("so-cart") || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.Quantity || 1), 0);
  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? "inline" : "none";

  // Simple pulse animation
  badge.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
      { transform: "scale(1)" },
    ],
    { duration: 300 }
  );
}

// Simple alert message (success or error)
export function alertMessage(message, isError = false) {
  const container = qs("#alert-container");
  if (!container) return;

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${isError ? "error" : "success"} show`;
  alertDiv.textContent = message;

  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove("show");
    alertDiv.remove();
  }, 3000);
}
