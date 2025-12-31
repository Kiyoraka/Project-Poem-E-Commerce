/**
 * app.js - Main Application Entry Point
 * Fantasy Book E-Commerce
 * Handles: Global initialization, page detection, admin login
 */

/* ============================================
   ADMIN CREDENTIALS & SESSION
   ============================================ */

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

const ADMIN_SESSION_KEY = 'fantasy_books_admin_session';

/**
 * Check if admin is logged in
 * @returns {boolean} Login status
 */
function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

/**
 * Set admin session
 * @param {boolean} loggedIn - Login status
 */
function setAdminSession(loggedIn) {
  if (loggedIn) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/**
 * Logout admin
 */
function adminLogout() {
  setAdminSession(false);
  window.location.href = 'index.html';
}

/* ============================================
   ADMIN LOGIN MODAL
   ============================================ */

/**
 * Open admin login modal
 */
function openAdminLoginModal() {
  const modal = $('#adminLoginModal');
  if (modal) {
    // Clear form
    const form = $('#adminLoginForm');
    if (form) form.reset();

    // Hide error
    const error = $('#loginError');
    if (error) error.classList.add('hidden');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus on email input
    const emailInput = $('#adminEmail');
    if (emailInput) emailInput.focus();
  }
}

/**
 * Close admin login modal
 */
function closeAdminLoginModal() {
  const modal = $('#adminLoginModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Handle admin login form submission
 * @param {Event} e - Form submit event
 */
function handleAdminLogin(e) {
  e.preventDefault();

  const emailInput = $('#adminEmail');
  const passwordInput = $('#adminPassword');
  const errorEl = $('#loginError');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validate credentials
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // Login successful
    setAdminSession(true);
    closeAdminLoginModal();
    window.location.href = 'dashboard.html';
  } else {
    // Login failed
    if (errorEl) {
      errorEl.classList.remove('hidden');
    }
    // Shake animation
    const form = $('#adminLoginForm');
    if (form) {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  }
}

/**
 * Setup admin login event listeners
 */
function setupAdminLoginListeners() {
  // Admin button (open modal)
  const adminBtn = $('#adminBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      // If already logged in, go directly to dashboard
      if (isAdminLoggedIn()) {
        window.location.href = 'dashboard.html';
      } else {
        openAdminLoginModal();
      }
    });
  }

  // Close button
  const closeBtn = $('#closeAdminLoginBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAdminLoginModal);
  }

  // Click outside to close
  const modal = $('#adminLoginModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAdminLoginModal();
      }
    });
  }

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = $('#adminLoginModal');
      if (modal && modal.classList.contains('active')) {
        closeAdminLoginModal();
      }
    }
  });

  // Login form submission
  const loginForm = $('#adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  // Clear error on input
  const emailInput = $('#adminEmail');
  const passwordInput = $('#adminPassword');
  const errorEl = $('#loginError');

  if (emailInput && errorEl) {
    emailInput.addEventListener('input', () => {
      errorEl.classList.add('hidden');
    });
  }

  if (passwordInput && errorEl) {
    passwordInput.addEventListener('input', () => {
      errorEl.classList.add('hidden');
    });
  }
}

/* ============================================
   APPLICATION INITIALIZATION
   ============================================ */

/**
 * Initialize application
 */
function initApp() {
  // Detect current page and initialize accordingly
  const currentPage = detectCurrentPage();

  console.log(`Fantasy Books E-Commerce initialized on: ${currentPage}`);

  // Global initialization
  initializeData(); // Ensure sample data is loaded
  updateCartBadge(); // Update cart badge on all pages

  // Setup admin login listeners on landing page
  if ($('#adminLoginModal')) {
    setupAdminLoginListeners();
  }

  // Page-specific initialization is handled by individual JS files
}

/**
 * Detect current page based on URL or DOM elements
 * @returns {string} Page name
 */
function detectCurrentPage() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('cart')) return 'cart';
  if (path.includes('checkout')) return 'checkout';
  if (path.includes('dashboard')) return 'dashboard';

  // Default to landing page
  return 'landing';
}

/* ============================================
   GLOBAL EVENT HANDLERS
   ============================================ */

/**
 * Handle storage changes (for multi-tab sync)
 */
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.CART) {
    updateCartBadge();
  }
});

/* ============================================
   INITIALIZE ON LOAD
   ============================================ */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
