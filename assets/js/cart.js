/**
 * cart.js - Shopping Cart Logic
 * Fantasy Book E-Commerce
 * Handles: Cart management, modal display, quantity updates, totals
 */

/* ============================================
   CART STORAGE OPERATIONS
   ============================================ */

const CART_KEY = 'fantasy_books_cart';

/**
 * Get cart from localStorage
 * @returns {Array} Cart items
 */
function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error('Error reading cart:', e);
    return [];
  }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

/**
 * Clear cart
 */
function clearCart() {
  saveCart([]);
  updateCartBadge();
}

/**
 * Get total price of cart
 * @returns {number} Total price
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Get total item count in cart
 * @returns {number} Item count
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Add item to cart
 * @param {Object} book - Book object
 * @param {number} quantity - Quantity to add
 */
function addToCart(book, quantity = 1) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.bookId === book.id);

  if (existingIndex !== -1) {
    // Update quantity if already in cart
    cart[existingIndex].quantity += quantity;
    cart[existingIndex].quantity = clamp(cart[existingIndex].quantity, 1, 99);
  } else {
    // Add new item
    cart.push({
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image,
      quantity: quantity
    });
  }

  saveCart(cart);
  updateCartBadge();

  return cart;
}

/* ============================================
   CART MODAL OPERATIONS
   ============================================ */

/**
 * Open cart modal
 */
function openCartModal() {
  const modal = $('#cartModal');
  if (modal) {
    renderCartModal();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close cart modal
 */
function closeCartModal() {
  const modal = $('#cartModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Render cart modal content
 */
function renderCartModal() {
  const cartItems = $('#cartModalItems');
  const cartEmpty = $('#cartModalEmpty');
  const cartSummary = $('#cartModalSummary');
  const cartCount = $('#modalCartCount');

  if (!cartItems) return;

  const cart = getCart();
  const itemCount = getCartItemCount();

  // Update header count
  if (cartCount) {
    cartCount.textContent = `(${itemCount} item${itemCount !== 1 ? 's' : ''})`;
  }

  // Check if cart is empty
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    if (cartEmpty) cartEmpty.classList.remove('hidden');
    if (cartSummary) cartSummary.classList.add('hidden');
    return;
  }

  if (cartEmpty) cartEmpty.classList.add('hidden');
  if (cartSummary) cartSummary.classList.remove('hidden');

  // Render cart items
  cartItems.innerHTML = cart.map(item => createCartModalItemHTML(item)).join('');

  // Update summary
  updateCartModalSummary();

  // Setup quantity listeners
  setupCartModalQuantityListeners();
}

/**
 * Create HTML for cart modal item
 * @param {Object} item - Cart item
 * @returns {string} HTML string
 */
function createCartModalItemHTML(item) {
  return `
    <div class="cart-modal-item" data-book-id="${item.bookId}">
      <div class="cart-modal-item-image" style="background-image: url('${item.image}');"></div>
      <div class="cart-modal-item-details">
        <div class="cart-modal-item-title">${item.title}</div>
        <div class="cart-modal-item-author">by ${item.author}</div>
        <div class="cart-modal-item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
      <div class="cart-modal-item-actions">
        <button class="cart-modal-item-remove" data-book-id="${item.bookId}" title="Remove item">
          &times;
        </button>
        <div class="cart-modal-quantity">
          <button class="cart-modal-qty-btn cart-qty-decrease" data-book-id="${item.bookId}">-</button>
          <span class="cart-modal-qty-value">${item.quantity}</span>
          <button class="cart-modal-qty-btn cart-qty-increase" data-book-id="${item.bookId}">+</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update cart modal summary
 */
function updateCartModalSummary() {
  const subtotalEl = $('#cartModalSubtotal');
  const shippingEl = $('#cartModalShipping');
  const totalEl = $('#cartModalTotal');

  const subtotal = getCartTotal();

  // Free shipping over RM100
  const shipping = subtotal >= 100 ? 0 : 5.00;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Update cart badge
  updateCartBadge();
}

/* ============================================
   CART ITEM OPERATIONS
   ============================================ */

/**
 * Update item quantity
 * @param {number} bookId - Book ID
 * @param {number} newQuantity - New quantity
 */
function updateItemQuantity(bookId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.bookId === bookId);

  if (itemIndex === -1) return;

  newQuantity = clamp(parseInt(newQuantity) || 1, 1, 99);

  cart[itemIndex].quantity = newQuantity;
  saveCart(cart);

  renderCartModal();
}

/**
 * Remove item from cart
 * @param {number} bookId - Book ID
 */
function removeFromCart(bookId) {
  const cart = getCart();
  const newCart = cart.filter(item => item.bookId !== bookId);

  saveCart(newCart);
  renderCartModal();

  showToast('Item removed from cart', 'info');
}

/**
 * Increase item quantity
 * @param {number} bookId - Book ID
 */
function increaseQuantity(bookId) {
  const cart = getCart();
  const item = cart.find(item => item.bookId === bookId);

  if (item && item.quantity < 99) {
    updateItemQuantity(bookId, item.quantity + 1);
  }
}

/**
 * Decrease item quantity
 * @param {number} bookId - Book ID
 */
function decreaseQuantity(bookId) {
  const cart = getCart();
  const item = cart.find(item => item.bookId === bookId);

  if (item) {
    if (item.quantity <= 1) {
      // Ask to remove
      if (confirm('Remove this item from cart?')) {
        removeFromCart(bookId);
      }
    } else {
      updateItemQuantity(bookId, item.quantity - 1);
    }
  }
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

/**
 * Setup cart modal quantity listeners
 */
function setupCartModalQuantityListeners() {
  // Decrease buttons
  $$('.cart-qty-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = parseInt(e.target.dataset.bookId);
      decreaseQuantity(bookId);
    });
  });

  // Increase buttons
  $$('.cart-qty-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = parseInt(e.target.dataset.bookId);
      increaseQuantity(bookId);
    });
  });

  // Remove buttons
  $$('.cart-modal-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = parseInt(e.target.dataset.bookId);
      removeFromCart(bookId);
    });
  });
}

/**
 * Setup cart modal event listeners
 */
function setupCartModalEventListeners() {
  // Cart button (open modal)
  const cartBtn = $('#cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCartModal);
  }

  // Footer cart link
  const footerCartLink = $('#footerCartLink');
  if (footerCartLink) {
    footerCartLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCartModal();
    });
  }

  // Close button
  const closeBtn = $('#closeCartModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartModal);
  }

  // Click outside to close
  const modal = $('#cartModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeCartModal();
      }
    });
  }

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = $('#cartModal');
      if (modal && modal.classList.contains('active')) {
        closeCartModal();
      }
    }
  });

  // Clear cart button
  const clearCartBtn = $('#clearCartModalBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        clearCart();
        renderCartModal();
        showToast('Cart cleared', 'info');
      }
    });
  }

  // Checkout button
  const checkoutBtn = $('#checkoutModalBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
      }
      closeCartModal();
      window.location.href = 'checkout.html';
    });
  }

  // Continue browsing button
  const continueBtn = $('#continueBrowsingBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      closeCartModal();
    });
  }
}

/* ============================================
   CART BADGE UPDATE (Global)
   ============================================ */

/**
 * Update cart badge count (works on all pages)
 */
function updateCartBadge() {
  const cartBadge = $('#cartBadge');
  if (!cartBadge) return;

  const count = getCartItemCount();
  cartBadge.textContent = count;
  cartBadge.dataset.count = count;

  if (count > 0) {
    cartBadge.style.display = 'flex';
  } else {
    cartBadge.style.display = 'none';
  }
}

/* ============================================
   INITIALIZE
   ============================================ */

// Initialize cart functionality
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Always update cart badge
    updateCartBadge();

    // Setup cart modal event listeners (on landing page)
    if ($('#cartModal')) {
      setupCartModalEventListeners();
    }
  });
}
