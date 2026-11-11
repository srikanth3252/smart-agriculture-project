# 🌾 Farmer Marketplace

A full-stack Farmer-to-Customer Marketplace built with React, Node.js, Express.js and MySQL. Farmers can list agricultural products, customers can browse and order them, and an admin can manage the entire platform.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (CRA), CSS3, React Router DOM, Fetch API |
| Backend | Node.js, Express.js (REST API) |
| Database | MySQL 8.0 (mysql2) |
| Auth | bcryptjs + JSON Web Tokens (JWT) |
| File Upload | multer |
| Security | helmet, cors, parameterized queries |

---

## 📁 Project Structure

```
Farmer-Marketplace/
├── client/                   # React frontend (CRA)
│   ├── public/
│   └── src/
│       ├── components/       # Navbar, Footer, ProductCard, ProtectedRoute
│       ├── context/          # AuthContext, CartContext
│       ├── pages/            # One .jsx + .css per page
│       ├── services/         # API service layer (api.js, authService.js, …)
│       └── styles/           # global.css (CSS variables, resets, shared classes)
│
└── server/                   # Node.js + Express backend
    ├── config/               # db.js (MySQL pool)
    ├── controllers/          # Route handlers
    ├── middleware/           # auth, role, error, upload
    ├── models/               # SQL query functions
    ├── routes/               # Express router files
    ├── scripts/              # initDb.js, seedAdmin.js
    ├── uploads/              # Uploaded product images (local)
    ├── schema.sql            # Full DB schema + seed data
    └── server.js             # Express entry point
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or later — https://nodejs.org
- **MySQL 8.0** running locally — https://dev.mysql.com/downloads/
- **npm** (bundled with Node.js)

---

## 🚀 Installation & Setup

### 1. Clone / download the project

```bash
cd "c:\Users\HP\OneDrive\Documents\smart agriculture project"
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Edit `server/.env` with your MySQL root password:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=farmer_marketplace
DB_PORT=3306
JWT_SECRET=super_secret_farmer_marketplace_jwt_key_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

The `client/.env` file is already set for local development:

```env
REACT_APP_API_URL=https://smart-agriculture-project.onrender.com/api
REACT_APP_SERVER_URL=https://smart-agriculture-project.onrender.com
```

### 5. Initialize the database

```bash
cd server
node scripts/initDb.js --password=YOUR_MYSQL_PASSWORD
```

This creates the `farmer_marketplace` database, all 7 tables, indexes, and seed data (3 demo users, 10 market price records, 6 sample products).

---

## ▶️ Running Locally

Open **two terminal windows**:

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm start
```

Expected: `MySQL Database connected successfully to farmer_marketplace`

**Terminal 2 — Frontend (port 3000):**
```bash
cd client
npm start
```

Then open **http://localhost:3000** in your browser.

---

## 👤 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@farmer.com | Admin@123 |
| Farmer | ramesh.farmer@example.com | Farmer@123 |
| Customer | priya.customer@example.com | Customer@123 |

---

## 🗄️ Database Schema

7 tables in `farmer_marketplace`:

| Table | Purpose |
|---|---|
| `users` | All users (farmer / customer / admin) |
| `products` | Agricultural product listings |
| `carts` | One cart per customer |
| `cart_items` | Items in each cart |
| `orders` | Customer orders (COD) |
| `order_items` | Products in each order |
| `market_prices` | Crop price tiers (high/good/avg/low) |

Stock deduction on order placement is atomic — uses `BEGIN / COMMIT / ROLLBACK` with `SELECT … FOR UPDATE` row locks.

---

## 🔌 API Endpoints

### Auth
| Method | URL | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Logged in |
| PUT | `/api/auth/profile` | Logged in |

### Products
| Method | URL | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Farmer |
| PUT | `/api/products/:id` | Farmer (owner) |
| DELETE | `/api/products/:id` | Farmer (owner) |
| GET | `/api/products/farmer/my-products` | Farmer |
| GET | `/api/products/farmer/stats` | Farmer |

### Cart
| Method | URL | Access |
|---|---|---|
| GET | `/api/cart` | Customer |
| POST | `/api/cart/add` | Customer |
| PUT | `/api/cart/item/:id` | Customer |
| DELETE | `/api/cart/item/:id` | Customer |
| DELETE | `/api/cart/clear` | Customer |

### Orders
| Method | URL | Access |
|---|---|---|
| POST | `/api/orders` | Customer |
| GET | `/api/orders/my-orders` | Customer |
| GET | `/api/orders/farmer-orders` | Farmer |
| PUT | `/api/orders/:id/status` | Farmer |
| GET | `/api/orders/:id` | Logged in |

### Market Prices & Crop Suggestions
| Method | URL | Access |
|---|---|---|
| GET | `/api/prices` | Public |
| GET | `/api/prices/crop/:cropName` | Public |
| GET | `/api/suggestions` | Public |

### Admin
| Method | URL | Access |
|---|---|---|
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/status` | Admin |
| GET | `/api/admin/products` | Admin |
| DELETE | `/api/admin/products/:id` | Admin |
| GET | `/api/admin/orders` | Admin |

---

## 🏗️ Features

### Three User Roles
- **Farmer** — Add/edit/delete products, manage orders, view market price guidance, get crop suggestions
- **Customer** — Browse marketplace, cart, COD checkout, order history, profile management
- **Admin** — Platform overview, manage users (disable/enable), moderate products, view all orders

### Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT Bearer token authentication (7-day expiry)
- Role-based route protection (frontend + backend)
- Parameterized SQL queries (no SQL injection)
- Duplicate email/phone registration blocked
- Admin role cannot be self-registered

### Product Features
- Image upload (multer, max 5 MB, images only)
- Category, unit (kg/quintal/ton), location
- Availability toggle
- Filter by category, location, price range
- Sort by price / newest

---

## 🏭 Production Build

```bash
cd client
npm run build
```

Serve the `client/build/` folder with a static server or configure Express to serve it.

---

## ☁️ Deployment Notes

> [!WARNING]
> `server/uploads/` is **local disk storage**. It does NOT work on serverless platforms (Vercel, Railway ephemeral disks).
> For production deployment, replace multer disk storage with **AWS S3** or **Cloudinary**.

**Recommended deployment:**
- Backend → Railway / Render (persistent disk or S3 for uploads)
- Frontend → Vercel / Netlify (set `REACT_APP_API_URL` to your backend URL)
- Database → PlanetScale / Railway MySQL / AWS RDS

---

## 🧑‍💻 Development Notes

- Frontend runs on port **3000**, backend on port **5000**
- CORS is configured to allow `http://localhost:3000` in development
- All API calls go through `client/src/services/api.js` (reads `REACT_APP_API_URL`)
- Each page has its own CSS file; global styles in `src/styles/global.css`
- No Tailwind, no Bootstrap — plain CSS3 only

---

## 📄 License

This is a portfolio project. Free to use for educational purposes.

