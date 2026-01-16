// Load product data at runtime (browser-safe)
let products = [];
let productsReady = false;

fetch("/data/products.json")
  .then(res => res.json())
  .then(data => {
    products = data;
    productsReady = true;
  })
  .catch(err => {
    console.error("Failed to load product data:", err);
  });

// Wait until products are loaded
function waitForProducts() {
  return new Promise((resolve) => {
    if (productsReady) return resolve();
    const interval = setInterval(() => {
      if (productsReady) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

// Load cart from localStorage
export function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Save cart
export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartDropdown();
}

// Flash success with custom text
function flashSuccess(button, originalHTML, successText) {
  button.disabled = true;
  button.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${successText}`;

  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }, 1200);
}

// Add item to cart
export async function addToCart(id, quantity = 1) {
  await waitForProducts();

  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    console.error("Invalid product ID:", id);
    alert("Product not found. Please try again.");
    return;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id,
      quantity,
      name: product.name || "Unnamed Product",
      image: product.image || "/media/placeholder.png",
      price: product.price || 0
    });
  }

  saveCart(cart);

  const btn = document.querySelector(`button[onclick="addToCart('${id}', 1)"]`);
  if (btn) {
    flashSuccess(
      btn,
      `<i class="bi bi-cart-plus me-2"></i> Add to Cart`,
      "Added to Cart!"
    );
  }
}

// Update navbar badge
export function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badge = document.getElementById("cart-count");
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("d-none");
  } else {
    badge.classList.add("d-none");
  }
}

// Instant checkout (bypass cart)
export async function instantCheckout(id) {
  await waitForProducts();

  const product = products.find((p) => p.id === id);
  if (!product) {
    console.error("Invalid product ID:", id);
    alert("Product not found. Please try again.");
    return;
  }

  const btn = document.querySelector(`button[onclick="instantCheckout('${id}')"]`);
  if (btn) {
    flashSuccess(
      btn,
      `<i class="bi bi-lightning-fill me-2"></i> Buy Now`,
      "Redirecting…"
    );
  }

  const items = [{ id, quantity: 1 }];

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });

  const data = await res.json();

  if (data.url) {
    window.location = data.url;
  } else {
    console.error("Checkout error:", data);
    alert("Unable to start checkout.");
  }
}

export function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

// Render dropdown contents
export function renderCartDropdown() {
  const cart = getCart();
  const container = document.getElementById("cart-dropdown-content");
  if (!container) return;

  const checkoutBtn = document.getElementById("dropdown-checkout");

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-muted mb-0">Cart is empty</p>`;
    if (checkoutBtn) checkoutBtn.classList.add("d-none");
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove("d-none");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  container.innerHTML =
    cart
      .map(
        (item) => `
        <div class="d-flex align-items-center mb-2">
          <div 
            class="rounded me-2"
            style="
              width: 40px;
              height: 40px;
              min-width: 40px;
              min-height: 40px;
              overflow: hidden;
            "
          >
            <img 
              src="${item.image || "/media/placeholder.png"}"
              alt="${item.name || "Product"}"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </div>
          
          <div class="flex-grow-1">
            <div class="fw-semibold">${item.name || "Unnamed Product"}</div>
            <small class="text-muted">Qty: ${item.quantity}</small>
          </div>

          <button 
            type="button"
            class="btn-close ms-2"
            aria-label="Remove"
            onclick="event.stopPropagation(); removeFromCart('${item.id}')"
          ></button>
        </div>
      `
      )
      .join("") +
    `
      <div class="d-flex justify-content-between border-top pt-2 mt-2">
        <strong>Total:</strong>
        <strong>$${(total / 100).toFixed(2)}</strong>
      </div>
    `;
}

// Disable buttons on product page if sold out
async function applySoldOutState() {
  await waitForProducts();

  const path = window.location.pathname;
  const match = path.match(/\/products\/([^\/]+)$/);
  if (!match) return;

  const productId = match[1];
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (product.soldOut) {
    const addBtn = document.querySelector("button[onclick^=\"addToCart\"]");
    const buyBtn = document.querySelector("button[onclick^=\"instantCheckout\"]");

    if (addBtn) {
      addBtn.disabled = true;
      addBtn.classList.add("btn-secondary");
      addBtn.classList.remove("btn-primary");
      addBtn.innerHTML = `<i class="bi bi-x-circle me-2"></i> Sold Out`;
    }

    if (buyBtn) {
      buyBtn.disabled = true;
      buyBtn.classList.add("btn-secondary");
      buyBtn.classList.remove("btn-success");
      buyBtn.innerHTML = `<i class="bi bi-x-circle me-2"></i> Unavailable`;
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartDropdown();
  applySoldOutState();

  const checkoutBtn = document.getElementById("dropdown-checkout");
  if (checkoutBtn) {
    checkoutBtn.innerHTML = `Checkout <i class="bi bi-box-arrow-up-right ms-2"></i>`;
    checkoutBtn.addEventListener("click", async () => {
      const cart = getCart();

      if (cart.length === 0) {
        container.innerHTML = `<p class="text-center text-muted mb-0">Cart is empty</p>`;

        const checkoutBtn = document.getElementById("dropdown-checkout");
        if (checkoutBtn) checkoutBtn.classList.add("d-none");

        return;
      }


      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart })
      });

      const data = await res.json();
      if (data.url) window.location = data.url;
    });
  }
});

// Expose functions globally
window.addToCart = addToCart;
window.instantCheckout = instantCheckout;
window.updateCartBadge = updateCartBadge;
window.removeFromCart = removeFromCart;
