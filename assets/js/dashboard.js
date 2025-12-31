/**
 * dashboard.js - Admin Dashboard Logic
 * Fantasy Book E-Commerce
 * Handles: Stats, orders management, books inventory
 */

/* ============================================
   DASHBOARD STATE
   ============================================ */

let currentView = 'dashboard';
let currentOrderFilter = '';
let currentOrderSearch = '';

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
 * Render all orders
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

  if (orders.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tableBody.innerHTML = orders.map(order => {
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
 * Render books inventory
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

  tableBody.innerHTML = books.map(book => {
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
      renderOrders();
    });
  }

  // Order search
  const searchInput = $('#orderSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentOrderSearch = e.target.value;
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
