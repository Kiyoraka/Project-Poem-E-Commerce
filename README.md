# Fantasy Book E-Commerce

A static e-commerce website for fantasy books with a Forest & Parchment theme. Features a customer-facing store with shopping cart, guest checkout, order tracking, and an admin dashboard for order management.

## Features

### Customer Features
- **Book Catalog** - Browse 10 fantasy books with filtering, sorting, and search
- **Shopping Cart** - Modal-based cart with quantity controls
- **Guest Checkout** - No registration required, simple checkout form
- **Order Tracking** - Track orders by phone number or order ID
- **Pagination** - 8 books per page for better browsing experience

### Admin Features
- **Protected Dashboard** - Login required (admin@gmail.com / admin123)
- **Order Management** - View, filter, and update order status
- **Books Inventory** - View all books with stock levels
- **Statistics** - Order counts, revenue, and inventory stats
- **Pagination** - Paginated tables for orders and books

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: LocalStorage for cart and orders
- **Design**: Modular CSS architecture
- **Theme**: Forest & Parchment (Classic Fantasy)

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Forest Green | `#2D5016` | Primary |
| Saddle Brown | `#8B4513` | Secondary |
| Old Lace | `#FDF5E6` | Background |
| Parchment | `#F5E6D3` | Surface |
| Dark Brown | `#2C1810` | Text |
| Goldenrod | `#DAA520` | Accent |

## Project Structure

```
Project Fantasy Book E-Commerce/
│
├── index.html              # Landing page (store)
├── checkout.html           # Guest checkout page
├── dashboard.html          # Admin dashboard
├── favicon.png             # Browser favicon
├── README.md               # This file
│
├── assets/
│   ├── styles/
│   │   ├── base.css        # Variables, reset, typography
│   │   ├── components.css  # Buttons, cards, forms, badges
│   │   ├── landing.css     # Store page styles
│   │   ├── checkout.css    # Checkout form styles
│   │   ├── dashboard.css   # Admin dashboard styles
│   │   └── modal.css       # Modal styles (cart, tracking, login)
│   │
│   ├── js/
│   │   ├── data.js         # Books catalog & sample orders
│   │   ├── utils.js        # Helper functions
│   │   ├── cart.js         # Cart modal logic
│   │   ├── checkout.js     # Checkout form & order creation
│   │   ├── landing.js      # Store page logic
│   │   ├── dashboard.js    # Admin dashboard logic
│   │   ├── modal.js        # Order tracking modal
│   │   └── app.js          # Main initialization & admin login
│   │
│   └── images/
│       ├── logo.png        # Site logo
│       └── books/          # Book cover images (10 images)
│
└── Project Resource/
    └── project-plan.md     # Development documentation
```

## Pages

### Landing Page (`index.html`)
- Hero section with call-to-action
- Book catalog with search, filter, and sort
- Pagination (8 books per page)
- Cart modal popup
- Order tracking modal popup
- Admin login modal popup

### Checkout Page (`checkout.html`)
- Order summary
- Customer information form
- Payment method selection
- Order confirmation

### Admin Dashboard (`dashboard.html`)
- Protected by login (session-based)
- Dashboard view with statistics
- Orders view with status management
- Books inventory view
- Logout functionality

## Getting Started

1. **Clone or download** the project
2. **Open `index.html`** in a web browser
3. **Browse books** and add to cart
4. **Checkout** as a guest
5. **Track orders** using phone number or order ID

### Admin Access
- Click **Admin** button in header
- Login with:
  - Email: `admin@gmail.com`
  - Password: `admin123`

## Book Catalog

| # | Title | Genre | Price (RM) |
|---|-------|-------|------------|
| 1 | The Dragon's Heir | Epic Fantasy | 45.90 |
| 2 | Shadow of the Throne | Dark Fantasy | 52.00 |
| 3 | The Crystal Mage | High Fantasy | 38.50 |
| 4 | Realm of the Forgotten | Adventure Fantasy | 49.90 |
| 5 | The Last Enchanter | Romantic Fantasy | 41.00 |
| 6 | Blood of the Phoenix | Mythic Fantasy | 55.90 |
| 7 | Whispers of the Void | Cosmic Fantasy | 47.50 |
| 8 | The Iron Kingdom | Steampunk Fantasy | 43.00 |
| 9 | Song of the Siren | Oceanic Fantasy | 39.90 |
| 10 | The Wanderer's Path | Quest Fantasy | 36.50 |

## Order Statuses

| Status | Description |
|--------|-------------|
| Pending | Order received, awaiting processing |
| Processing | Order being prepared |
| Shipped | Order dispatched |
| Delivered | Order completed |
| Cancelled | Order cancelled |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is for educational purposes.

## Author

**Afif Maahi**

---

*Built with vanilla HTML, CSS, and JavaScript*
