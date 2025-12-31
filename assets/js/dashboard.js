/**
 * dashboard.js - Admin Dashboard Logic
 * Fantasy Book E-Commerce
 * Handles: Stats, orders management, books inventory, pagination
 */

/* ============================================
   DASHBOARD STATE
   ============================================ */

let currentView = 'dashboard';
let currentOrderFilter = '';
let currentOrderSearch = '';

// Pagination state
let ordersPagination = {
  currentPage: 1,
  perPage: 10,
  totalItems: 0,
  totalPages: 0
};

let booksPagination = {
  currentPage: 1,
  perPage: 10,
  totalItems: 0,
  totalPages: 0
};

/* ============================================
   INITIALIZATION
   ============================================ */

/**
 * Initialize dashboard
 */
function initDashboard() {
  // Set current date
  setCurrentDate();

  // Render dashboard stats
  renderDashboardStats();

  // Render recent orders
  renderRecentOrders();

  // Setup navigation
  setupDashboardNav();

  // Setup event listeners
  setupDashboardEventListeners();

  // Setup pagination listeners
  setupPaginationListeners();
}

/**
 * Set current date in header
 */
function setCurrentDate() {
  const dateEl = $('#currentDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-MY', options);
  }
}

/* ============================================
   PAGINATION HELPERS
   ============================================ */

/**
 * Generate page numbers array with ellipsis
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @returns {Array} Page numbers array
 */
function generatePageNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
  }

  return pages;
}

/**
 * Render pagination controls
 * @param {string} type - 'orders' or 'books'
 * @param {Object} pagination - Pagination state
 */
function renderPagination(type, pagination) {
  const pagesContainer = $(`#${type}PageNumbers`);
  const rangeText = $(`#${type}RangeText`);
  const prevBtn = $(`#${type}PrevBtn`);
  const nextBtn = $(`#${type}NextBtn`);
  const paginationEl = $(`#${type}Pagination`);

  if (!pagesContainer) return;

  // Hide pagination if no items
  if (pagination.totalItems === 0) {
    if (paginationEl) paginationEl.style.display = 'none';
    return;
  }

  if (paginationEl) paginationEl.style.display = 'flex';

  // Update range text
  const start = (pagination.currentPage - 1) * pagination.perPage + 1;
  const end = Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems);
  if (rangeText) {
    rangeText.textContent = `${start}-${end} of ${pagination.totalItems}`;
  }

  // Update prev/next buttons
  if (prevBtn) {
    prevBtn.disabled = pagination.currentPage === 1;
  }
  if (nextBtn) {
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
  }

  // Generate page numbers
  const pageNumbers = generatePageNumbers(pagination.currentPage, pagination.totalPages);

  pagesContainer.innerHTML = pageNumbers.map(page => {
    if (page === '...') {
      return `<span class="page-btn ellipsis">...</span>`;
    }
    return `
      <button class="page-btn ${page === pagination.currentPage ? 'active' : ''}"
              data-page="${page}" data-type="${type}">
        ${page}
      </button>
    `;
  }).join('');

  // Add click listeners to page buttons
  pagesContainer.querySelectorAll('.page-btn:not(.ellipsis)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      const paginationType = e.target.dataset.type;
      goToPage(paginationType, page);
    });
  });
}

/**
 * Go to specific page
 * @param {string} type - 'orders' or 'books'
 * @param {number} page - Page number
 */
function goToPage(type, page) {
  if (type === 'orders') {
    ordersPagination.currentPage = page;
    renderOrders();
  } else if (type === 'books') {
    booksPagination.currentPage = page;
    renderBooks();
  }
}

/**
 * Setup pagination event listeners
 */
function setupPaginationListeners() {
  // Orders per page
  const ordersPerPage = $('#ordersPerPage');
  if (ordersPerPage) {
    ordersPerPage.addEventListener('change', (e) => {
      ordersPagination.perPage = parseInt(e.target.value);
      ordersPagination.currentPage = 1;
      renderOrders();
    });
  }

  // Orders prev/next
  const ordersPrevBtn = $('#ordersPrevBtn');
  const ordersNextBtn = $('#ordersNextBtn');
  if (ordersPrevBtn) {
    ordersPrevBtn.addEventListener('click', () => {
      if (ordersPagination.currentPage > 1) {
        ordersPagination.currentPage--;
        renderOrders();
      }
    });
  }
  if (ordersNextBtn) {
    ordersNextBtn.addEventListener('click', () => {
      if (ordersPagination.currentPage < ordersPagination.totalPages) {
        ordersPagination.currentPage++;
        renderOrders();
      }
    });
  }

  // Books per page
  const booksPerPage = $('#booksPerPage');
  if (booksPerPage) {
    booksPerPage.addEventListener('change', (e) => {
      booksPagination.perPage = parseInt(e.target.value);
      booksPagination.currentPage = 1;
      renderBooks();
    });
  }

  // Books prev/next
  const booksPrevBtn = $('#booksPrevBtn');
  const booksNextBtn = $('#booksNextBtn');
  if (booksPrevBtn) {
    booksPrevBtn.addEventListener('click', () => {
      if (booksPagination.currentPage > 1) {
        booksPagination.currentPage--;
        renderBooks();
      }
    });
  }
  if (booksNextBtn) {
    booksNextBtn.addEventListener('click', () => {
      if (booksPagination.currentPage < booksPagination.totalPages) {
        booksPagination.currentPage++;
        renderBooks();
      }
    });
  }
}

/* ============================================
   DASHBOARD VIEW
   ============================================ */

/**
 * Render dashboard stats
 */
function renderDashboardStats() {
  const stats = getOrderStats();

  // Update stat values
  const totalOrdersEl = $('#totalOrders');
  const pendingOrdersEl = $('#pendingOrders');
  const processingOrdersEl = $('#processingOrders');
  const deliveredOrdersEl = $('#deliveredOrders');
  const totalRevenueEl = $('#totalRevenue');
  const pendingBadgeEl = $('#pendingOrdersBadge');

  if (totalOrdersEl) totalOrdersEl.textContent = stats.total;
  if (pendingOrdersEl) pendingOrdersEl.textContent = stats.pending;
  if (processingOrdersEl) processingOrdersEl.textContent = stats.processing;
  if (deliveredOrdersEl) deliveredOrdersEl.textContent = stats.delivered;
  if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(stats.totalRevenue);
  if (pendingBadgeEl) {
    pendingBadgeEl.textContent = stats.pending;
    pendingBadgeEl.style.display = stats.pending > 0 ? 'inline' : 'none';
  }
}

/**
 * Render recent orders (last 5)
 */
function renderRecentOrders() {
  const tableBody = $('#recentOrdersTable');
  if (!tableBody) return;

  const orders = getAllOrders().slice(0, 5);

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted p-lg">No orders yet</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(order => {
    const statusInfo = getStatusInfo(order.status);
    return `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.customerName}</td>
        <td>${formatPrice(order.total)}</td>
        <td><span class="badge badge-${order.status}">${statusInfo.label}</span></td>
        <td>${formatDate(order.createdAt)}</td>
      </tr>
    `;
  }).join('');
}

/* ============================================
   ORDERS VIEW
   ============================================ */

/**
 * Render all orders with pagination
 */
function renderOrders() {
  const tableBody = $('#ordersTable');
  const emptyState = $('#noOrdersFound');
  if (!tableBody) return;

  let orders = getAllOrders();

  // Apply status filter
  if (currentOrderFilter) {
    orders = orders.filter(order => order.status === currentOrderFilter);
  }

  // Apply search
  if (currentOrderSearch) {
    const search = currentOrderSearch.toLowerCase();
    orders = orders.filter(order =>
      order.id.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      order.phone.includes(search)
    );
  }

  // Update pagination state
  ordersPagination.totalItems = orders.length;
  ordersPagination.totalPages = Math.ceil(orders.length / ordersPagination.perPage);

  // Ensure current page is valid
  if (ordersPagination.currentPage > ordersPagination.totalPages) {
    ordersPagination.currentPage = Math.max(1, ordersPagination.totalPages);
  }

  // Apply pagination
  const startIndex = (ordersPagination.currentPage - 1) * ordersPagination.perPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + ordersPagination.perPage);

  if (orders.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    renderPagination('orders', ordersPagination);
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tableBody.innerHTML = paginatedOrders.map(order => {
    const statusInfo = getStatusInfo(order.status);
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return `
      <tr data-order-id="${order.id}">
        <td><strong>${order.id}</strong></td>
        <td>
          <div>${order.customerName}</div>
          <div class="text-sm text-muted">${order.phone}</div>
        </td>
        <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
        <td>${formatPrice(order.total)}</td>
        <td>
          <select class="status-select" data-order-id="${order.id}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${formatDate(order.createdAt)}</td>
        <td>
          <button class="btn btn-ghost btn-sm view-order-btn" data-order-id="${order.id}">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Setup status change handlers
  $$('.status-select').forEach(select => {
    select.addEventListener('change', handleStatusChange);
  });

  // Setup view order handlers
  $$('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', handleViewOrder);
  });

  // Render pagination
  renderPagination('orders', ordersPagination);
}

/**
 * Handle order status change
 * @param {Event} event - Change event
 */
function handleStatusChange(event) {
  const orderId = event.target.dataset.orderId;
  const newStatus = event.target.value;

  updateOrderStatus(orderId, newStatus);

  showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');

  // Refresh stats
  renderDashboardStats();
}

/**
 * Handle view order button click
 * @param {Event} event - Click event
 */
function handleViewOrder(event) {
  const orderId = event.target.dataset.orderId;
  const order = getOrderById(orderId);

  if (order) {
    showOrderModal(order);
  }
}

/**
 * Show order details modal
 * @param {Object} order - Order object
 */
function showOrderModal(order) {
  const modal = $('#orderModal');
  const content = $('#orderModalContent');

  if (!modal || !content) return;

  const statusInfo = getStatusInfo(order.status);

  content.innerHTML = `
    <div class="order-details-grid">
      <div class="order-detail-section">
        <div class="order-detail-title">Customer</div>
        <div class="order-detail-value">${order.customerName}</div>
        <div class="order-detail-value text-muted">${order.email}</div>
        <div class="order-detail-value text-muted">${order.phone}</div>
      </div>
      <div class="order-detail-section">
        <div class="order-detail-title">Shipping Address</div>
        <div class="order-detail-value">${order.address}</div>
      </div>
      <div class="order-detail-section">
        <div class="order-detail-title">Payment Method</div>
        <div class="order-detail-value">${order.paymentMethod || 'Not specified'}</div>
      </div>
      <div class="order-detail-section">
        <div class="order-detail-title">Order Date</div>
        <div class="order-detail-value">${formatDateTime(order.createdAt)}</div>
      </div>
    </div>

    <div class="order-items-section">
      <h3 class="section-title mb-md">Order Items</h3>
      <table class="order-items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>${formatPrice(item.price)}</td>
              <td>${formatPrice(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="3" class="text-right">Subtotal</td>
            <td>${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td colspan="3" class="text-right">Shipping</td>
            <td>${order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</td>
          </tr>
          <tr class="order-total-row">
            <td colspan="3" class="text-right">Total</td>
            <td>${formatPrice(order.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${order.notes ? `
      <div class="order-detail-section mb-lg">
        <div class="order-detail-title">Notes</div>
        <div class="order-detail-value">${order.notes}</div>
      </div>
    ` : ''}

    <div class="order-status-update">
      <span>Status:</span>
      <select class="status-select" id="modalStatusSelect" data-order-id="${order.id}">
        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
      <button class="btn btn-primary" id="updateStatusBtn">Update Status</button>
    </div>
  `;

  // Show modal
  modal.classList.add('active');

  // Setup modal event handlers
  const updateBtn = $('#updateStatusBtn');
  const statusSelect = $('#modalStatusSelect');
  if (updateBtn && statusSelect) {
    updateBtn.addEventListener('click', () => {
      updateOrderStatus(order.id, statusSelect.value);
      showToast('Order status updated', 'success');
      closeOrderModal();
      renderOrders();
      renderDashboardStats();
    });
  }
}

/**
 * Close order modal
 */
function closeOrderModal() {
  const modal = $('#orderModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/* ============================================
   BOOKS VIEW
   ============================================ */

/**
 * Render books inventory with pagination
 */
function renderBooks() {
  const tableBody = $('#booksTable');
  const totalBooksEl = $('#totalBooks');
  const totalStockEl = $('#totalStock');
  const avgPriceEl = $('#avgPrice');

  if (!tableBody) return;

  const books = getAllBooks();
  const stats = getBookStats();

  // Update stats
  if (totalBooksEl) totalBooksEl.textContent = stats.totalBooks;
  if (totalStockEl) totalStockEl.textContent = stats.totalStock;
  if (avgPriceEl) avgPriceEl.textContent = formatPrice(stats.averagePrice);

  // Update pagination state
  booksPagination.totalItems = books.length;
  booksPagination.totalPages = Math.ceil(books.length / booksPagination.perPage);

  // Ensure current page is valid
  if (booksPagination.currentPage > booksPagination.totalPages) {
    booksPagination.currentPage = Math.max(1, booksPagination.totalPages);
  }

  // Apply pagination
  const startIndex = (booksPagination.currentPage - 1) * booksPagination.perPage;
  const paginatedBooks = books.slice(startIndex, startIndex + booksPagination.perPage);

  tableBody.innerHTML = paginatedBooks.map(book => {
    const stockClass = book.stock === 0 ? 'text-error' : book.stock <= 10 ? 'text-warning' : '';

    return `
      <tr>
        <td>
          <div class="book-row-info">
            <div class="book-row-image" style="background-image: url('${book.image}');"></div>
            <span class="book-row-title">${book.title}</span>
          </div>
        </td>
        <td>${book.author}</td>
        <td><span class="badge badge-primary">${book.genre}</span></td>
        <td>${formatPrice(book.price)}</td>
        <td class="${stockClass}">${book.stock}</td>
        <td>
          <span class="text-accent">&#9733;</span>
          ${book.rating} (${book.reviews})
        </td>
      </tr>
    `;
  }).join('');

  // Render pagination
  renderPagination('books', booksPagination);
}

/* ============================================
   NAVIGATION
   ============================================ */

/**
 * Setup dashboard navigation
 */
function setupDashboardNav() {
  $$('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // View All buttons
  $$('[data-view]').forEach(btn => {
    if (!btn.classList.contains('nav-item')) {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        switchView(view);
      });
    }
  });
}

/**
 * Switch between views
 * @param {string} viewName - View name
 */
function switchView(viewName) {
  currentView = viewName;

  // Update nav active state
  $$('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Show/hide views
  $$('.view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = $(`#${viewName}View`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update header title
  const titleEl = $('#viewTitle');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard',
      orders: 'Orders',
      books: 'Books Inventory'
    };
    titleEl.textContent = titles[viewName] || 'Dashboard';
  }

  // Render view content
  switch (viewName) {
    case 'orders':
      renderOrders();
      break;
    case 'books':
      renderBooks();
      break;
    case 'dashboard':
      renderDashboardStats();
      renderRecentOrders();
      break;
  }

  // Close mobile sidebar
  closeMobileSidebar();
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
  // Order status filter
  const statusFilter = $('#orderStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentOrderFilter = e.target.value;
      ordersPagination.currentPage = 1; // Reset to page 1 on filter
      renderOrders();
    });
  }

  // Order search
  const searchInput = $('#orderSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentOrderSearch = e.target.value;
      ordersPagination.currentPage = 1; // Reset to page 1 on search
      renderOrders();
    }, 300));
  }

  // Close order modal
  const closeModalBtn = $('#closeOrderModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeOrderModal);
  }

  // Click outside modal to close
  const modal = $('#orderModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeOrderModal();
      }
    });
  }

  // Mobile menu toggle
  const menuToggle = $('#menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileSidebar);
  }

  // Logout button
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('fantasy_books_admin_session');
    window.location.href = 'index.html';
  }
}

/**
 * Toggle mobile sidebar
 */
function toggleMobileSidebar() {
  const sidebar = $('#sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
  const sidebar = $('#sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

/* ============================================
   TOAST (Dashboard uses landing.js toast, but backup)
   ============================================ */

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = $('#toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '&#10004;',
    error: '&#10006;',
    warning: '&#9888;',
    info: '&#8505;'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  setTimeout(() => removeToast(toast), duration);
}

/**
 * Remove toast
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.add('hiding');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/* ============================================
   INITIALIZE
   ============================================ */

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initDashboard);
}
