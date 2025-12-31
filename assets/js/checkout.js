/**
 * checkout.js - Checkout Page Logic
 * Fantasy Book E-Commerce
 * Handles: Form validation, order creation, confirmation
 */

/* ============================================
   CHECKOUT INITIALIZATION
   ============================================ */

/**
 * Initialize checkout page
 */
function initCheckoutPage() {
  // Check if cart is empty
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  // Render order summary
  renderCheckoutSummary();

  // Setup form validation
  setupCheckoutForm();
}

/* ============================================
   RENDER FUNCTIONS
   ============================================ */

/**
 * Render checkout order summary
 */
function renderCheckoutSummary() {
  const summaryItems = $('#summaryItems');
  const subtotalEl = $('#checkoutSubtotal');
  const shippingEl = $('#checkoutShipping');
  const totalEl = $('#checkoutTotal');

  if (!summaryItems) return;

  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 100 ? 0 : 5.00;
  const total = subtotal + shipping;

  // Render items
  summaryItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-image" style="background-image: url('${item.image}');"></div>
      <div class="summary-item-details">
        <div class="summary-item-title">${item.title}</div>
        <div class="summary-item-qty">Qty: ${item.quantity}</div>
      </div>
      <div class="summary-item-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');

  // Update totals
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

/* ============================================
   FORM VALIDATION
   ============================================ */

/**
 * Setup checkout form validation
 */
function setupCheckoutForm() {
  const form = $('#checkoutForm');
  if (!form) return;

  form.addEventListener('submit', handleFormSubmit);

  // Real-time validation
  const inputs = form.querySelectorAll('input[required], select[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Validate all fields
  if (!validateForm(form)) {
    showToast('Please fill in all required fields correctly', 'error');
    return;
  }

  // Create order
  createOrder(form);
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean} True if valid
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], select[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Validate single field
 * @param {HTMLInputElement} input - Input element
 * @returns {boolean} True if valid
 */
function validateField(input) {
  const value = input.value.trim();
  const name = input.name;
  let error = '';

  // Required check
  if (!value) {
    error = 'This field is required';
  }
  // Specific validations
  else {
    switch (name) {
      case 'email':
        if (!isValidEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!isValidPhone(value)) {
          error = 'Please enter a valid Malaysian phone number';
        }
        break;

      case 'postcode':
        if (!/^\d{5}$/.test(value)) {
          error = 'Postcode must be 5 digits';
        }
        break;

      case 'customerName':
        if (value.length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
    }
  }

  // Show/hide error
  const errorEl = $(`#${name}Error`);
  if (error) {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = error;
    return false;
  } else {
    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
    return true;
  }
}

/**
 * Clear field error
 * @param {HTMLInputElement} input - Input element
 */
function clearFieldError(input) {
  input.classList.remove('error');
  const errorEl = $(`#${input.name}Error`);
  if (errorEl) errorEl.textContent = '';
}

/* ============================================
   ORDER CREATION
   ============================================ */

/**
 * Create order from form data
 * @param {HTMLFormElement} form - Form element
 */
function createOrder(form) {
  const formData = new FormData(form);
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 100 ? 0 : 5.00;
  const total = subtotal + shipping;

  // Build order object
  const order = {
    id: generateOrderId(),
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: `${formData.get('address')}, ${formData.get('city')}, ${formData.get('postcode')} ${formData.get('state')}`,
    items: cart.map(item => ({
      bookId: item.bookId,
      title: item.title,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    status: 'pending',
    paymentMethod: formData.get('paymentMethod'),
    notes: formData.get('notes') || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save order
  saveOrder(order);

  // Clear cart
  clearCart();

  // Show confirmation
  showOrderConfirmation(order);
}

/**
 * Show order confirmation
 * @param {Object} order - Order object
 */
function showOrderConfirmation(order) {
  const checkoutContent = $('#checkoutContent');
  const confirmation = $('#orderConfirmation');
  const confirmationEmail = $('#confirmationEmail');
  const confirmationOrderId = $('#confirmationOrderId');

  if (checkoutContent) checkoutContent.classList.add('hidden');
  if (confirmation) confirmation.classList.remove('hidden');

  if (confirmationEmail) confirmationEmail.textContent = order.email;
  if (confirmationOrderId) confirmationOrderId.textContent = order.id;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Track order button
  const trackBtn = $('#trackOrderConfirmBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      // Store order ID for tracking
      sessionStorage.setItem('trackOrderId', order.id);
      window.location.href = 'index.html';
    });
  }
}

/* ============================================
   INITIALIZE
   ============================================ */

// Initialize on checkout page
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on checkout page
    if ($('#checkoutForm')) {
      initCheckoutPage();
    }
  });
}
