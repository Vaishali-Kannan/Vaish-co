# Vaish&Co. — Little things, lovely finds.

A complete, production-oriented multi-category e-commerce web platform combining modern marketplace discovery, 3-speed quick commerce delivery, a **Vaish Coins** loyalty rewards ledger, and **Vee**—a catalogue-grounded AI shopping assistant.

---

## 🌟 Key Highlights & Features

### 1. Curated Storefront & Soft Pink Aesthetic
- **Brand Identity**: Curated editorial light-theme with delicate blush background (`#FFFAFC`), pale pink (`#FFF0F5`), primary pink (`#D9799E`), and deep rose accents (`#B9577E`).
- **Typography**: Editorial headings in **Playfair Display** paired with modern sans body in **DM Sans**.
- **Catalog Categories**: Beauty & Skincare, Fashion & Lifestyle, Electronics & Tech, Grocery & Fresh, Home & Living, and Everyday Essentials.
- **Rich Interaction**: Search bar with real-time autocomplete suggestions, animated announcement bar, and responsive drawer navigation.

### 2. Three Distinct Delivery Modes
Users can select their preferred delivery tempo directly on the homepage and header:
- **⚡ Quick Delivery (15–45 minutes)**: Filter items available for instant hyper-local fulfillment.
- **🚀 Fast Delivery (1–2 Days)**: Priority air & surface dispatch; free on orders ≥ ₹999.
- **📦 Standard Delivery (3–5 Days)**: Consolidated national delivery; free on orders ≥ ₹499.

### 3. Vaish Coins — Loyalty Rewards System
- **Earning Rate**: Earn 1 Vaish Coin for every ₹100 of eligible completed purchases.
- **Direct Redemption**: 1 Coin = ₹0.50 discount. Apply coins via slider at checkout to offset up to 20% of cart total.
- **Wishlist Drops**: Apply earned coins toward items in your saved wishlist.
- **Rewards Wallet**: Dedicated dashboard with transaction ledger (`EARNED`, `REDEEMED`, `ADJUSTED`, `REVERSED`).

### 4. Vee — AI Shopping Assistant
- Floating assistant modal in the bottom-right corner.
- **Catalogue-Grounded Intelligence**: Suggests genuine products with real prices and photos directly from PostgreSQL.
- **Predefined Fallbacks**: Operates seamlessly even if no third-party AI API key is configured.
- **Quick Prompts**: Gift ideas, budget picks under ₹500, quick delivery filter, and beauty comparisons.

### 5. Multi-Step Checkout & Payment Processing
- **Step 1**: Delivery address selection or new address entry with PIN code check.
- **Step 2**: Delivery speed selection (Quick / Fast / Standard) with dynamic pricing.
- **Step 3**: Order summary with Vaish Coins redemption slider and promo code support (`WELCOME10`, `VAISH50`).
- **Step 4**: Payment choices:
  - **Online Payment**: Razorpay test integration simulation with signature verification.
  - **Cash on Delivery (COD)**: With configurable limit verification.
  - **Pay Later**: Documented demonstration provider abstraction.

### 6. Order Lifecycle & Tracking
- **Statuses**: `PENDING_PAYMENT` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` (with `CANCELLED` and `REFUNDED` transitions).
- **Interactive Timeline**: Visual milestone tracking in order details.
- **One-Click Cancellation**: Self-service order cancellation for processing orders with instant reward & payment restoration.

### 7. Protected Admin Dashboard (`/admin`)
- Accessible only to authenticated users with `Role.ADMIN`.
- Real-time business KPIs: Total Revenue (from completed orders), Total Orders, Catalog Size, Customer Accounts.
- Order status workflow updater.
- New catalogue item creation modal.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, React Router v6, TanStack Query.
- **Backend**: Node.js, Express.js, TypeScript, Zod validation, Centralized error handling, Winston structured logging, Swagger / OpenAPI docs.
- **Database & ORM**: PostgreSQL, Prisma ORM, Prisma Client, Comprehensive database seed script.
- **Authentication**: JWT access tokens, argon2/bcrypt password hashing, role-based authorization (`CUSTOMER`, `ADMIN`).
- **Testing**: Vitest, Supertest.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+
- npm v10+

### 1. Start the PostgreSQL Database
An embedded PostgreSQL database engine is provided out of the box (requires zero external setup):
```bash
npm run db:start
```
*PostgreSQL will listen on `localhost:5432` with database `vaish_and_co`.*

### 2. Generate Prisma Client & Sync Database
```bash
npx prisma db push --schema=./prisma/schema.prisma
```

### 3. Seed the Database
Loads realistic multi-category products, variants, customer reviews, and demo users:
```bash
npx tsx prisma/seed.ts
```

### 4. Start Development Servers
Start both the API backend and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger API Docs**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health Endpoint**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `demo@vaishandco.com` | `Password123!` |
| **Admin** | `admin@vaishandco.com` | `Password123!` |

*(One-click demo login buttons are also provided on the sign-in page)*

---

## 🧪 Automated Test Suite

Run the automated backend test suite:
```bash
npm run test --workspace=apps/api
```
**Test Results**: 14 tests passing across Health, Catalogue, Delivery Eligibility, Auth, Rewards Balance, Vee AI Chatbot, and Admin Route Access Control.

Build verification for production:
```bash
npm run build --workspace=apps/web
```

---

## 📦 Project Structure

```
vaish-and-co/
├── apps/
│   ├── web/                     # React + Vite Frontend
│   │   ├── src/
│   │   │   ├── components/      # Header, Footer, AnnouncementBar, ProductCard, VeeChatbot
│   │   │   ├── context/         # AuthContext, CartContext, DeliveryContext, WishlistContext
│   │   │   ├── lib/             # API client library (normalized fetch wrapper)
│   │   │   ├── pages/           # HomePage, ProductListing, ProductDetail, Cart, Checkout, etc.
│   │   │   ├── types/           # TypeScript definitions
│   │   │   ├── App.tsx          # Router configuration
│   │   │   └── main.tsx         # React root
│   │   ├── tailwind.config.js   # Soft pink brand color palette & typography
│   │   └── vite.config.ts       # Vite bundler & API proxy
│   └── api/                     # Express REST API Server
│       ├── src/
│       │   ├── config/          # Database, Environment, Swagger configs
│       │   ├── middleware/      # Auth, Role checking, Rate limiting, Error handling
│       │   ├── modules/         # Auth, Catalogue, Cart, Wishlist, Orders, Payments, Rewards, Chat, Admin
│       │   ├── app.ts           # Express application setup
│       │   └── server.ts        # Server entry point
│       └── package.json
├── prisma/
│   ├── schema.prisma            # Normalized multi-model schema
│   └── seed.ts                  # Multi-category catalogue seed script
├── scripts/
│   └── start-db.js              # Native PostgreSQL daemon runner
├── .env.example                 # Environment variables specification
└── README.md
```

---

## 🔌 Integrations: Live vs Demo Mode

| Service | Mode | Details |
| :--- | :--- | :--- |
| **PostgreSQL & Prisma** | **Live** | Full schema push, relations, indexes, transactions, and seeding. |
| **Authentication & RBAC** | **Live** | Password hashing, JWT token verification, role enforcement. |
| **Vee AI Assistant** | **Live / Fallback** | Connected to Google Gemini API (`GEMINI_API_KEY`). Gracefully falls back to catalogue keyword matching when unconfigured. |
| **Razorpay Payments** | **Sandbox / Demo** | Integrated via test keys (`RAZORPAY_KEY_ID`), order generation, and signature verification. |
| **Email Service** | **Development** | Configured for Ethereal SMTP with local console logging. |
