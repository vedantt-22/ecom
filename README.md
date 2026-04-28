<div align="center">

# 🛒 ShopApp — Full-Stack E-Commerce Platform

**A production-grade e-commerce application built with Node.js, Express, TypeORM, SQLite, and Angular 17.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Security Implementation](#-security-implementation)
- [Key Design Decisions](#-key-design-decisions)

---

## 🔍 Overview

ShopApp is a fully-featured e-commerce platform implementing three user roles — **Guest**, **Customer**, and **Admin** — with a complete shopping experience from browsing to purchase. The application runs as a **single Node.js process on a single port**, with Express serving both the API and the compiled Angular frontend in production.

The project demonstrates production-level patterns including JWT authentication with HTTP-only cookies, an in-memory session store for real-time session revocation, database transactions for checkout atomicity, role-based access control, lazy-loaded Angular modules, and server-side search with pagination.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│              Single Node.js Process (Port 3000)      │
│                                                     │
│  ┌─────────────────┐      ┌──────────────────────┐  │
│  │  Angular 17     │      │  Express REST API    │  │
│  │  (Compiled)     │◄────►│  Routes → Controllers│  │
│  │  Static Files   │      │  → Services → TypeORM│  │
│  └─────────────────┘      └──────────┬───────────┘  │
│                                      │               │
│                           ┌──────────▼───────────┐  │
│                           │   SQLite Database     │  │
│                           │   (ecommerce.db)      │  │
│                           └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### The Three-Layer Backend Pattern

Every domain follows a strict **Routes → Controllers → Services** architecture:

| Layer | Responsibility | What It Cannot Do |
|---|---|---|
| **Routes** | Define URL, apply middleware | Touch database or business logic |
| **Controllers** | Extract `req` data, call service, send `res` | Hash passwords, query DB directly |
| **Services** | All business logic | Know about `req` or `res` |

This separation means services are independently testable, routes are swappable without touching business logic, and the codebase scales without tangling responsibilities.

---

## 🛠 Tech Stack

### Backend

| Package | Role |
|---|---|
| `express` | Web framework and HTTP routing |
| `typeorm` | ORM — maps TypeScript classes to database tables |
| `sqlite3` | SQLite database driver |
| `passport` + `passport-jwt` | JWT authentication strategy |
| `jsonwebtoken` | JWT signing and verification |
| `bcrypt` | Password hashing with cost factor 12 |
| `cookie-parser` | HTTP cookie parsing middleware |
| `multer` | Multipart file upload handling |
| `helmet` | Security HTTP headers |
| `compression` | Gzip response compression |
| `express-rate-limit` | Rate limiting for auth endpoints |
| `express-validator` | Input validation and sanitisation |
| `uuid` | Unique session ID (jti) generation |
| `reflect-metadata` | Enables TypeORM decorators at runtime |

### Frontend

| Package | Role |
|---|---|
| `@angular/core` | Component system, dependency injection |
| `@angular/router` | Client-side routing, lazy loading, route guards |
| `@angular/forms` | Reactive Forms for validated form management |
| `@angular/common/http` | `HttpClient` with interceptor pipeline |
| `rxjs` | Reactive state with `BehaviorSubject` |

### DevTools

| Package | Role |
|---|---|
| `typescript` | Static typing and compilation |
| `ts-node-dev` | Dev server with hot reload |
| `@angular/cli` | Angular build toolchain |

---

## ✨ Features

### Customer Features
- 🔐 **Secure Authentication** — Register, login, logout with HTTP-only JWT cookies
- 🔑 **Multi-device Sessions** — View and terminate individual device sessions from profile
- 🔁 **Forgot Password** — 3-endpoint secure reset flow with rate-limited code retrieval
- 🛍 **Product Browsing** — Taxonomy-based navigation (Type → Category → Sub-Category → Product)
- 🔍 **Advanced Search** — Full-text search across name and description, cross-taxonomy results
- 🎛 **Filtering** — Price range, in-stock only, taxonomy drill-down, sort order
- 📄 **Pagination** — Server-side pagination capped at 50 per page
- ⚡ **Autocomplete** — Fast name suggestions endpoint (rate limited)
- 🛒 **Persistent Cart** — Cart stored in database, survives logout and server restarts
- 💳 **Checkout** — Atomic database transaction (order + items + stock + cart in one unit)
- 📦 **Order History** — Historical price snapshots — shows what you actually paid
- 👁 **Recently Viewed** — Last 10 viewed products tracked per customer
- 📍 **Address Management** — Multiple shipping addresses with default selection
- ⭐ **Product Reviews** — Ratings with verified purchase detection
- 🔗 **Share Products** — Copy-to-clipboard share button with deep-linkable URLs

### Admin Features
- 📊 **Dashboard** — Real-time stats (customers, orders, locked accounts, active sessions)
- 📦 **Product CRUD** — Create, edit, soft-delete, and restore products with image upload
- 🏷 **Taxonomy Management** — Full CRUD for product types, categories, and sub-categories
- 👥 **Customer Management** — View all customers with active session counts
- 🔒 **Immediate Account Locking** — Lock account + kill all active sessions simultaneously
- 🛒 **Order Management** — View all orders with expandable detail and status updates
- 💰 **Payment Records** — View and update payment status per order

### Technical Highlights
- Single-process production deployment (Express serves Angular + API)
- HTTP-only cookie authentication (XSS-proof)
- In-memory session Map with per-device logout capability
- Soft delete for products preserves order history integrity
- Database transactions guarantee checkout atomicity
- Lazy-loaded Angular admin module (customers never download admin code)
- `asyncHandler` wrapper eliminates boilerplate try/catch across all controllers
- Taxonomy tree cached in memory (5-minute TTL)
- `Promise.all` for parallel dashboard queries

---

## 📁 Project Structure

```
ecommerce-app/
│
├── backend/
│   ├── src/
│   │   ├── entities/           # TypeORM entity classes (DB table definitions)
│   │   │   ├── User.ts
│   │   │   ├── Product.ts      # Includes @DeleteDateColumn for soft delete
│   │   │   ├── Order.ts
│   │   │   ├── OrderItem.ts    # Contains priceAtPurchase (price snapshot)
│   │   │   ├── Cart.ts
│   │   │   ├── CartItem.ts
│   │   │   ├── Address.ts
│   │   │   ├── Review.ts
│   │   │   ├── Payment.ts
│   │   │   ├── RecentlyViewed.ts
│   │   │   ├── PasswordResetCode.ts
│   │   │   ├── ProductType.ts
│   │   │   ├── Category.ts
│   │   │   └── SubCategory.ts
│   │   │
│   │   ├── routes/             # URL definitions + middleware application
│   │   ├── controllers/        # HTTP translation layer (req → service → res)
│   │   ├── services/           # All business logic
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # requireAuth + requireRole factory
│   │   │   ├── error.middleware.ts  # Global error handler
│   │   │   └── logger.middleware.ts # Color-coded request logging
│   │   ├── migrations/         # Versioned database schema changes
│   │   ├── seeds/              # Initial data (admin, taxonomy, products)
│   │   ├── utils/
│   │   │   ├── asyncHandler.ts # Wraps async controllers — forwards errors
│   │   │   ├── multer.config.ts
│   │   │   ├── validation.ts
│   │   │   ├── validateEnv.ts  # Startup env validation
│   │   │   ├── cache.ts        # Simple TTL in-memory cache
│   │   │   └── AppError.ts     # Typed error classes with HTTP status codes
│   │   ├── types/
│   │   │   └── express.d.ts    # Extends Express.User with jti + app fields
│   │   ├── sessionStore.ts     # Dual-Map session store (jti → info, userId → Set<jti>)
│   │   ├── passport.ts         # Passport-JWT strategy + cookie extractor
│   │   ├── data-source.ts      # TypeORM DataSource singleton
│   │   ├── app.ts              # Express configuration (middleware + routes)
│   │   └── server.ts           # DB init → app.listen entry point
│   │
│   ├── ProductImages/          # Uploaded product images stored on disk
│   ├── ecommerce.db            # SQLite database file (git-ignored)
│   ├── .env                    # Secret environment variables (git-ignored)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    └── src/
        └── app/
            ├── core/
            │   ├── guards/         # AuthGuard, AdminGuard
            │   ├── interceptors/   # CredentialsInterceptor (withCredentials)
            │   ├── services/       # Auth, Cart, Product, Order, Address, Review, Payment
            │   └── models/         # All TypeScript interfaces (barrel export)
            ├── features/
            │   ├── auth/           # Login, Register, Forgot Password, Verify, Reset
            │   ├── products/       # Product List (search/filter), Product Detail
            │   ├── cart/
            │   ├── checkout/
            │   ├── orders/         # Order List, Order Detail (confirmation mode)
            │   └── profile/        # Edit profile, change password, session management
            ├── admin/              # Lazy-loaded AdminModule
            │   ├── dashboard/
            │   ├── products/
            │   ├── customers/
            │   └── orders/
            └── shared/
                └── components/     # Navbar, ProductCard, Pagination
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Angular CLI v17: `npm install -g @angular/cli@17`

### 1. Clone the Repository

```bash
git clone https://github.com/vedantt-22/ecom.git
cd ecom/ecommerce-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# Edit .env with your values (see Environment Variables section)

# Run database migrations
npm run migration:run

# Seed initial data (admin user + taxonomy + sample products)
npm run seed

# Start development server
npm run dev
```

The backend will be running at `http://localhost:3000`.

Default admin credentials after seeding:
```
Email:    admin@store.com
Password: Admin@123
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start Angular development server (proxy forwards /api to port 3000)
npm start
```

Open `http://localhost:4200` in your browser.

### 4. Production Build

```bash
# Build backend
cd backend && npm run build

# Build Angular (output goes to dist/frontend/browser/)
cd ../frontend && npm run build

# Run production server (serves both API and Angular)
cd ../backend
NODE_ENV=production npm start
```

Open `http://localhost:3000` — the Express server serves everything.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# Database
DB_TYPE=sqlite
DB_DATABASE=ecommerce.db
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Authentication
JWT_SECRET=your_very_long_random_secret_at_least_64_characters_change_this_in_production

# Server
NODE_ENV=development
PORT=3000
```

> ⚠️ Never commit `.env` to version control. The `.gitignore` excludes it by default.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register new customer |
| `POST` | `/auth/login` | None | Login — sets HTTP-only cookie |
| `POST` | `/auth/logout` | ✅ | Logout current session |
| `POST` | `/auth/logout/:sessionId` | ✅ | Logout specific device by jti |
| `POST` | `/auth/logout-all` | ✅ | Logout all devices |
| `POST` | `/auth/forgot-password` | None | Generate reset code (nothing in response) |
| `POST` | `/auth/get-reset-code` | None | Retrieve stored code — rate limited 3/15min |
| `POST` | `/auth/reset-password` | None | Set new password using code |

### Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` | ✅ | Get profile + active sessions list |
| `PUT` | `/profile` | ✅ | Update name and email |
| `PUT` | `/profile/change-password` | ✅ | Change password (invalidates all other sessions) |

### Products & Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | None | All products (list view) |
| `GET` | `/products/:id` | Optional | Product detail + tracks recently viewed |
| `GET` | `/products/recently-viewed` | Customer | Last 10 viewed products |
| `GET` | `/products/:id/reviews` | None | Reviews + rating distribution |
| `POST` | `/products/:id/reviews` | Customer | Write a review |
| `GET` | `/search` | None | Full search with filters and pagination |
| `GET` | `/search/autocomplete?q=` | None | Fast name suggestions — rate limited |
| `GET` | `/taxonomy/tree` | None | Full taxonomy tree |

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/cart` | Customer | Get cart with items and totals |
| `POST` | `/cart/items` | Customer | Add item (idempotent — increments if exists) |
| `PUT` | `/cart/items/:id` | Customer | Update quantity |
| `DELETE` | `/cart/items/:id` | Customer | Remove item |
| `DELETE` | `/cart` | Customer | Clear entire cart |

### Orders & Checkout

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders/checkout` | Customer | Checkout — atomic database transaction |
| `GET` | `/orders/my` | Customer | My order history |
| `GET` | `/orders/:id` | Customer/Admin | Order detail |

### Addresses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/addresses` | Customer | All addresses (default first) |
| `POST` | `/addresses` | Customer | Create new address |
| `PUT` | `/addresses/:id` | Customer | Update address |
| `DELETE` | `/addresses/:id` | Customer | Delete address |
| `PATCH` | `/addresses/:id/set-default` | Customer | Set as default |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin | Stats overview |
| `GET` | `/admin/customers` | Admin | All customers with session counts |
| `PATCH` | `/admin/customers/:id/lock` | Admin | Lock account + kill all sessions |
| `PATCH` | `/admin/customers/:id/unlock` | Admin | Unlock account |
| `GET` | `/admin/orders` | Admin | All orders |
| `PATCH` | `/admin/orders/:id/status` | Admin | Update order status |
| `GET/POST/PUT/DELETE` | `/admin/products` | Admin | Product management |
| `GET` | `/admin/products/deleted` | Admin | Soft-deleted products |
| `PATCH` | `/admin/products/:id/restore` | Admin | Restore deleted product |
| `GET` | `/health` | None | Server health check |

---

## 🗄 Database Schema

### Entity Relationships

```
User ──────────────── Cart ──────── CartItem ─────┐
 │                                                 │
 └─── Order ─────── OrderItem ─────── Product ────┤
                      │               │            │
              priceAtPurchase       SubCategory ───┘
              (price snapshot)        │
                                    Category
                                      │
                                  ProductType
```

### Key Entities

**`OrderItem`** — Contains a `priceAtPurchase` column: a plain decimal value copied from `Product.price` at the exact moment of checkout. This is intentional denormalisation. Product prices can change; historical order totals must not.

**`Product`** — Contains a `@DeleteDateColumn() deletedAt`. TypeORM automatically excludes soft-deleted products from all queries. Hard delete would fail due to the `RESTRICT` foreign key from `OrderItem`.

**`User`** — Contains `isLocked: boolean`. Checked on every authenticated request. When `true`, all active sessions are also removed from the in-memory Map.

### Available npm Scripts (Backend)

```bash
npm run dev               # Start development server with hot reload
npm run build             # Compile TypeScript to dist/
npm start                 # Run compiled production build
npm run migration:generate -- --name=MigrationName  # Generate migration from entity changes
npm run migration:run     # Apply pending migrations
npm run migration:revert  # Rollback last migration
npm run migration:show    # List all migrations and their status
npm run seed              # Populate database with initial data
```

---

## 🔐 Security Implementation

### Authentication Flow

```
Login
  ↓
bcrypt.compare() — always runs (~250ms) even if email not found
(prevents timing attacks that reveal which emails are registered)
  ↓
jwt.sign({ id, role, jti: uuid() }, JWT_SECRET, { expiresIn: "7d" })
  ↓
sessionStore.create(jti, { userId, ip, userAgent, createdAt })
  ↓
res.cookie("token", jwt, { httpOnly: true, sameSite: "lax" })
```

### Every Protected Request

```
Request arrives with Cookie: token=eyJ...
  ↓
cookieParser() extracts token from cookie header
  ↓
passport-jwt verifies signature + checks expiry
  ↓
sessionStore.get(jti) — nanosecond Map lookup
  ↓
If undefined → 401 (JWT valid but session revoked)
  ↓
Load user from DB → check isLocked → attach to req.user
```

### Why HTTP-only Cookies Over localStorage

| | localStorage | HTTP-only Cookie |
|---|---|---|
| JavaScript readable? | ✅ Yes | ❌ No |
| XSS attack steals token? | ✅ Yes | ❌ No — JS cannot access it |
| Sent automatically? | ❌ No — must attach manually | ✅ Yes — browser handles it |
| CSRF protection | ❌ None needed (token in header) | ✅ `sameSite: "lax"` |

### Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /auth/register`, `POST /auth/login` | 20 requests / 15 minutes per IP |
| `POST /auth/get-reset-code` | 3 requests / 15 minutes per IP |
| `GET /search/autocomplete` | 60 requests / 1 minute per IP |

---

## 💡 Key Design Decisions

**Why separate `app.ts` and `server.ts`?**
`app.ts` configures Express (middleware, routes) and exports it. `server.ts` initialises the database then calls `app.listen()`. This means the app can be imported in tests without starting a real server. If the database fails to connect, `process.exit(1)` ensures the server never opens the port in a broken state.

**Why `priceAtPurchase` on `OrderItem`?**
Product prices change. Historical order records must show what the customer actually paid, not the current price. `priceAtPurchase` is copied once at checkout and never updated — deliberate denormalisation that makes order history immutable to future price changes.

**Why soft delete for products?**
The `RESTRICT` foreign key from `OrderItem` to `Product` prevents hard deletion of any product that appears in an order. Soft delete (`@DeleteDateColumn`) marks the product as deleted while keeping the row — order history remains intact, TypeORM excludes it from all customer-facing queries automatically.

**Why an in-memory Map for sessions instead of the database?**
Every single authenticated request checks the session store. A Map lookup is nanoseconds; a database query is milliseconds. The Map enables immediate session revocation — when an admin locks an account, `deleteAllForUser()` removes all their sessions instantly. The trade-off: sessions are lost on server restart (acceptable for this project; Redis would be the production solution).

**Why `manager.decrement()` for stock reduction?**
`UPDATE stock = stock - qty` is atomic at the SQL level. The alternative — load → subtract → save — has a race condition window where two simultaneous checkouts could both read `stock = 10`, both subtract, and both write `8`, effectively overselling. `decrement()` eliminates that window.

**Why a lazy-loaded `AdminModule`?**
Customers never download admin code. The Angular router evaluates `AdminGuard` synchronously before triggering the lazy `import()`. If the guard fails, the network request for the admin bundle never fires. This is both a performance and a security-perception benefit.

---

## 👤 Author

**Vedant Karekar**
[GitHub @vedantt-22](https://github.com/vedantt-22)

---

<div align="center">
Built with Node.js · Express · TypeORM · SQLite · Angular 17
</div>
