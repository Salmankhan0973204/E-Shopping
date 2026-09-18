# E-Shopping — Complete Project Guide

> A mentor-style breakdown of this project: what it is, how every piece works, how data flows
> from browser to database and back, and how you could rebuild it yourself from scratch.
>
> All file paths are relative to the repo root. Open the files as you read — this guide is
> meant to be read *next to* the code, not instead of it.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Third-Party Integrations](#3-third-party-integrations)
4. [Project Architecture](#4-project-architecture)
5. [Application Flow (End-to-End)](#5-application-flow-end-to-end)
6. [Key Features Breakdown](#6-key-features-breakdown)
7. [State Management](#7-state-management)
8. [API Handling](#8-api-handling)
9. [Performance & Optimization](#9-performance--optimization)
10. [Step-by-Step Learning Plan (Rebuild It Yourself)](#10-step-by-step-learning-plan)
11. [Improvement Suggestions](#11-improvement-suggestions)

---

## 1. Project Overview

**What it is:** A full-stack e-commerce store. Customers can browse products, search and
filter them, add items to a cart, pay with a credit card (Stripe), and track their orders.
Admins get a separate dashboard where they can manage products, categories, and orders,
and see revenue statistics.

**Project type:** A classic **two-tier web application**:

- A **REST API backend** (Express + MongoDB) that owns all data and business rules.
- A **Next.js frontend** that renders the UI and talks to the API over HTTP with JSON.

Both live in one git repository but are **two completely independent apps** — each has its
own `package.json`, its own `node_modules`, and runs as its own process. This layout is
often called a "multi-app repo" (a simple monorepo without workspace tooling).

```
Browser (localhost:3000)                    Server (localhost:5000)
┌──────────────────────────┐   HTTP/JSON   ┌──────────────────────────┐    ┌──────────┐
│  ecommerce-frontend      │ ────────────▶ │  ecommerce-backend       │───▶│ MongoDB  │
│  Next.js 16 + React 19   │ ◀──────────── │  Express 5 + Mongoose 9  │◀───│          │
└──────────────────────────┘               └───────────┬──────────────┘    └──────────┘
                                                       │
                                          ┌────────────┼────────────┐
                                          ▼            ▼            ▼
                                       Stripe     Nodemailer   Cloudinary
                                     (payments)    (emails)   (product images)
```

**Quick start** (two terminals):

```bash
# Terminal 1 — backend
cd ecommerce-backend
npm install
npm run seed        # creates admin user + 5 categories + 14 products
npm run dev         # nodemon on http://localhost:5000

# Terminal 2 — frontend
cd ecommerce-frontend
npm install
npm run dev         # Next.js on http://localhost:3000
```

Seeded admin login: `admin@eshopping.com` / `Admin@123`.
API documentation UI: http://localhost:5000/api-docs

---

## 2. Tech Stack

### Backend (`ecommerce-backend/`)

| Technology | Version | What it does here | Why this choice |
|---|---|---|---|
| **Node.js + ES Modules** | — | JavaScript runtime; `"type": "module"` in `package.json` means `import`/`export` syntax everywhere | One language (JS) across frontend and backend lowers the learning curve |
| **Express** | 5.2.1 | The HTTP framework — defines routes, runs middleware, sends responses | Minimal and unopinionated; you see every step of request handling, which is ideal for learning. (Alternatives like NestJS add structure but hide the plumbing.) |
| **MongoDB + Mongoose** | 9.6.2 | Database + Object-Document Mapper (ODM). Mongoose defines schemas, validates data, and gives you `Model.find()`, `Model.create()`, etc. | Product data is document-shaped (nested images, variants, embedded addresses) — it maps naturally to JSON documents. Mongoose adds the schema/validation layer MongoDB itself doesn't enforce |
| **jsonwebtoken** | 9.0.3 | Creates and verifies JWTs for authentication | Stateless auth: the server doesn't need a session store; the token itself proves who you are |
| **bcryptjs** | 3.0.3 | Hashes passwords before saving (cost factor 12) | Never store plain-text passwords. bcrypt is slow *on purpose* so brute-forcing hashes is expensive |
| **cookie-parser** | 1.4.7 | Reads the `refreshToken` HttpOnly cookie from requests | The refresh token lives in a cookie JavaScript can't read (XSS protection) |
| **cors** | 2.8.6 | Lets the browser at `:3000` call the API at `:5000` | Browsers block cross-origin requests by default; CORS headers opt in |
| **dotenv** | 17.4.2 | Loads `.env` into `process.env` | Keeps secrets (DB URI, JWT secrets, Stripe keys) out of the code and out of git |
| **stripe** | 22.3.0 | Server-side Stripe SDK — creates PaymentIntents | Card payments without ever touching raw card numbers |
| **nodemailer** | 9.0.3 | Sends the "verify your email" message via Gmail | Simple SMTP-based transactional email |
| **swagger-jsdoc + swagger-ui-express** | 6.3.0 / 5.0.1 | Builds interactive API docs at `/api-docs` from JSDoc comments in the route files | Documentation that lives next to the code it documents |
| **nodemon** (dev) | 3.1.14 | Restarts the server on file changes | Developer convenience |

### Frontend (`ecommerce-frontend/`)

| Technology | Version | What it does here | Why this choice |
|---|---|---|---|
| **Next.js (App Router)** | 16.2.7 | React framework: file-system routing under `src/app/`, layouts, dev server, bundling | Routing, code-splitting, and font optimization for free. Note: this project uses it mostly as a client-side SPA (see §9) |
| **React** | 19.2.4 | The UI library — components, hooks, state | Industry default; hooks (`useState`/`useEffect`) drive every page here |
| **Tailwind CSS** | v4 | All styling, via utility classes in JSX | No separate CSS files to maintain; v4 is "CSS-first" — configured in `src/app/globals.css` with `@theme`, so there is **no `tailwind.config.js`** |
| **axios** | 1.17.0 | The HTTP client, with interceptors for auth | Interceptors let one file (`src/lib/axios.js`) handle tokens and 401-retries for the whole app |
| **lucide-react** | 1.17.0 | Icon set used across customer pages | Lightweight, tree-shakeable SVG icons |
| **@stripe/stripe-js + @stripe/react-stripe-js** | 9.9.0 / 6.7.0 | Stripe's browser SDK + React bindings (`<Elements>`, `<CardElement>`) | The card input is an iframe hosted by Stripe — card numbers never touch your code (PCI compliance) |

**What is deliberately NOT here** (worth noticing as a learner): no TypeScript, no Redux/
Zustand, no TanStack Query, no form library, no component library (MUI/shadcn), no test
framework. The project does everything with the platform primitives — which makes it a
great codebase to learn fundamentals from, and also explains some of its rough edges (§11).

---

## 3. Third-Party Integrations

### Stripe (payments) — ACTIVE

- **Server config:** `ecommerce-backend/src/config/stripe.js` (uses `STRIPE_SECRET_KEY`)
- **Server logic:** `ecommerce-backend/src/services/pyment.service.js` *(note the typo in the filename — it works because imports match)* — creates a **PaymentIntent** for `amount * 100` cents and returns its `clientSecret`
- **Client:** `ecommerce-frontend/src/app/checkout/page.js` — wraps the page in `<Elements>` and confirms the payment with `stripe.confirmCardPayment(clientSecret, { card })`
- **The idea:** the secret key stays on the server; the browser only ever gets a one-time `clientSecret` that authorizes *this one* payment. Full flow in §5.3.

### Nodemailer + Gmail (transactional email) — ACTIVE

- `ecommerce-backend/src/utils/email.js` builds a Gmail SMTP transporter from `EMAIL_USER` / `EMAIL_PASS` and sends the account-verification email during registration. The email contains a link to `${FRONTEND_URL}/verify-email?token=<random token>`.
- A second, duplicate transporter exists at `src/config/nodemailer.js` but is **never imported** (dead code). `sendOrderEmail()` in `email.js` is also defined but never called.

### Cloudinary (image hosting) — ACTIVE (signed direct upload)

Product images upload **directly from the browser to Cloudinary** — image files never
pass through your backend. The trick is a *signed upload*: the backend (which holds the
API secret) signs the upload parameters, and Cloudinary accepts the browser's upload
because that signature proves your server authorized it.

```
 Admin browser                       Your backend                       Cloudinary
──────────────────────────────────────────────────────────────────────────────────
 1. GET /api/uploads/signature ───▶ upload.service.js signs
                                    { folder, timestamp } with
    ◀── { timestamp, signature,     CLOUDINARY_API_SECRET
          folder, apiKey,
          cloudName } ──────────────┘
 2. POST file + signature ──────────────────────────────────────▶ verifies signature,
    (plain fetch, no auth headers)                                stores the image
    ◀────────────────────────────────────── { secure_url, public_id }
 3. POST /api/products ───────────▶ saves the product with
    { ...fields, mainImage:         mainImage/gallery as plain
      {url, public_id}, gallery }   JSON — no file handling at all
```

- **Backend:** `src/routes/upload.routes.js` → `src/controllers/upload.controller.js` → `src/services/upload.service.js` (`GET /api/uploads/signature`, protect + adminOnly). The signed params (`folder` + `timestamp`) must exactly match what the browser sends, or Cloudinary rejects the upload.
- **Frontend:** `ecommerce-frontend/src/lib/cloudinaryUpload.js` — fetches one signature, uploads all selected files in parallel with plain `fetch` (deliberately not the axios instance, so no auth header or cookies leak to Cloudinary), and returns `{ url, public_id }` objects that `admin/products/page.js` sends as JSON.
- One signature is reused for the main image + gallery (Cloudinary signatures stay valid for about an hour).
- `uploadOnCloudinary()` in `src/utils/cloudinary.js` (the old server-side path) is now legacy — the same file also exports the configured `cloudinary` instance the signing service uses.
- Seeded products still use placeholder image URLs inserted directly by the seeders.

### Swagger / OpenAPI (API documentation) — ACTIVE

- Configured in `ecommerce-backend/src/app.js:19-69`; UI served at `/api-docs`.
- The spec is generated at runtime by scanning `./src/routes/*.js` for `@swagger` JSDoc blocks (33 of them across the 7 route files). Because that path is relative to the working directory, **you must start the server from inside `ecommerce-backend/`** or the docs come up empty.

---

## 4. Project Architecture

### 4.1 Backend folder structure — layered architecture

```
ecommerce-backend/
├── server.js                  ← ENTRY: load .env → connect DB → app.listen(5000)
├── src/
│   ├── app.js                 ← Express app: swagger, CORS, json, cookies, route mounts, error handler
│   ├── config/
│   │   ├── db.js              ← mongoose.connect(MONGO_URI); exits process on failure
│   │   ├── stripe.js          ← Stripe client instance
│   │   ├── cors.js            ← CORS allow-list, shared by app.js + error.middleware.js
│   │   └── nodemailer.js      ← (dead code — email.js has its own transporter)
│   ├── routes/                ← LAYER 1: URL → handler mapping + swagger docs + auth guards
│   │   ├── auth.routes.js  product.routes.js  category.routes.js
│   │   ├── order.route.js  review.routes.js  payment.route.js  dashboard.routes.js
│   │   └── upload.routes.js   ← GET /api/uploads/signature (signed Cloudinary upload)
│   ├── controllers/           ← LAYER 2: read req → call service → shape the HTTP response
│   ├── services/              ← LAYER 3: business logic + database queries
│   ├── models/                ← LAYER 4: Mongoose schemas (user, product, category, order, review, cart)
│   ├── middleware/
│   │   ├── auth.middleware.js ← protect (JWT check) + adminOnly (role check)
│   │   └── error.middleware.js← global error handler (last middleware)
│   ├── utils/
│   │   ├── asyncHandler.js    ← wraps async handlers so thrown errors reach errorHandler
│   │   ├── apiError.js        ← ApiError(statusCode, message)
│   │   ├── apiResponse.js     ← sendSuccess(res, code, msg, data) → {success, message, data}
│   │   ├── cloudinary.js  email.js
│   └── seeders/
│       ├── seed.js            ← admin + 5 categories + 14 products (safe to re-run)
│       └── seedBulk.js        ← 1000 generated products
```

**The layering rule** — every request passes through the same four stops:

```
Route ──▶ Controller ──▶ Service ──▶ Model (Mongoose) ──▶ MongoDB
 "which URL,      "HTTP in,          "business           "data shape
  which guards?"   HTTP out"          logic + queries"     + validation"
```

Traced example — `GET /api/products`:

1. **Route** `src/routes/product.routes.js` → `router.get("/", getAll)` (public, no guard)
2. **Controller** `src/controllers/product.controller.js` → `getAll` reads `req.query` (page, search, category…), calls the service, then `sendSuccess(res, 200, ..., { products, pagination })`
3. **Service** `src/services/product.service.js` → builds the Mongo filter, runs `Product.find(filter).populate("category", "name").sort().skip().limit()` and `countDocuments` in parallel
4. **Model** `src/models/product.model.js` → schema validation, the `category` reference that `.populate()` resolves

Why bother with layers? **Each layer is replaceable and testable on its own.** You could
unit-test the service without HTTP, or swap Express for something else without touching
business logic. When you rebuild this project, keeping this discipline is the single most
valuable habit to practice.

**Design patterns used in the backend:**

- **Middleware chain** — CORS → `express.json()` → `cookieParser()` → routes → `errorHandler` (`src/app.js:72-99`). Order matters: the error handler must be registered last.
- **Async-handler wrapper** — `src/utils/asyncHandler.js`. Express 4-style handlers don't catch rejected promises automatically; this tiny wrapper (`fn(req,res,next).catch(next)`) forwards every thrown error to the global error handler, so controllers stay clean of try/catch.
- **Response envelope** — every success is `{ success: true, message, data }` via `sendSuccess`. Consistency is the point: the frontend always reads `res.data.data.…` (and one place forgets this — see §11 bug #2).
- **Custom error type** — services `throw new ApiError(404, "Product not found")`; the error middleware turns `statusCode` into the HTTP status.
- **Guard middleware** — routes compose `protect` (valid JWT → load user → `req.user`) and `adminOnly` (`req.user.role === "admin"`), e.g. `router.post("/", protect, adminOnly, create)`.

### 4.2 Data models and their relationships

```
User ◀────────┐  createdBy         Category ◀─┐ parent (self-reference → nested categories)
 │ addresses[] │                      ▲        │
 │ (embedded)  │                      │ category
 │             │                   Product ── mainImage {url, public_id}, gallery[], variants[]
 │             │                      ▲
 │ user        │ user                 │ product
 ▼             ▼                      │
Order ── items[] (embedded cartItemSchema: product ref, quantity, price)
         address (embedded copy — snapshot at purchase time)
Review ── user ref + product ref + rating + comment
Cart  ── defined in cart.model.js but NEVER USED — the cart lives in browser localStorage
```

Two modeling ideas worth learning here:

- **Reference vs. embed.** `Order.items[].product` is a *reference* (an ObjectId you `populate()` later), while `Order.address` is an *embedded copy*. That's intentional: the address must be frozen as it was at purchase time, even if the user later edits their profile.
- **Self-reference for trees.** `Category.parent` points to another Category, giving nested categories with a single collection. The admin UI rebuilds the tree client-side (`buildTree` in `ecommerce-frontend/src/app/admin/categories/page.js`).

### 4.3 Frontend folder structure — Next.js App Router

```
ecommerce-frontend/src/
├── app/                          ← every folder with page.js becomes a URL
│   ├── layout.js                 ← RootLayout (the ONLY server component) — fonts, <body>, AuthProvider
│   ├── ClientAppContent.js       ← client shell: waits for auth init, renders Navbar + <main> + footer
│   ├── globals.css               ← Tailwind v4 entry (@import "tailwindcss" + @theme)
│   ├── page.js                   ← /            home: hero, categories, featured products
│   ├── products/page.js          ← /products    search + filter + pagination
│   ├── products/[id]/page.js     ← /products/:id  detail + add to cart
│   ├── cart/page.js              ← /cart        localStorage cart
│   ├── checkout/page.js          ← /checkout    address form + Stripe card + place order
│   ├── orders/page.js            ← /orders      my orders
│   ├── orders/[id]/page.js       ← /orders/:id  order detail
│   ├── login/  register/  check-email/  verify-email/   ← auth pages
│   ├── components/Navbar.js      ← the only shared component
│   └── admin/
│       ├── layout.js             ← admin sidebar + client-side role guard
│       ├── page.js               ← /admin       revenue/orders/products/customers stats
│       ├── products/  categories/  orders/      ← admin CRUD pages
├── context/AuthContext.js        ← global auth state (user, login, register, logout)
└── lib/
    ├── axios.js                  ← THE api client: baseURL, token store, interceptors
    ├── cart.js                   ← readCart/writeCart + "cartUpdated" event (badge)
    ├── cloudinaryUpload.js       ← browser → Cloudinary signed upload
    └── pagination.js             ← getPageNumbers() → [1, "…", 4, 5, 6, "…", 84]
```

Key architectural facts:

- **Routing is the file system.** `app/products/[id]/page.js` handles `/products/anything`; the component reads the id with `useParams()`. No router configuration file exists anywhere.
- **19 of 20 files start with `"use client"`.** Only the root layout is a server component. So although this is Next.js, it behaves like a classic SPA: HTML shell first, then JavaScript fetches data in `useEffect`. (What you'd change: §9.)
- **Layout nesting:** `RootLayout → AuthProvider → ClientAppContent → page`. Admin pages get an extra `AdminLayout` inside that. The Navbar hides itself on `/admin/*` routes by checking `usePathname()`.
- **Design patterns used:** Provider pattern (`AuthContext`), module-singleton (the axios instance and its in-memory token), interceptor pattern (auth headers + refresh), and "wrapper component" for Stripe (`<Elements>` must wrap anything calling `useStripe()`).

---

## 5. Application Flow (End-to-End)

This is the heart of the guide. Three flows cover almost everything the app does.

### 5.1 App boot — what happens when a user opens the site

```
Browser hits http://localhost:3000
  │
  ▼
RootLayout (server) renders fonts + <body> and mounts <AuthProvider>
  │
  ▼
AuthProvider useEffect fires  (src/context/AuthContext.js)
  │   POST /api/auth/refresh      ← browser silently attaches the HttpOnly
  │                                  refreshToken cookie (if one exists)
  ├── success ──▶ setAccessToken(newToken)   ← stored ONLY in memory (src/lib/axios.js)
  │              restore user from localStorage["user"]
  ├── failure ──▶ clear localStorage["user"]  (user is a guest)
  │
  ▼
isInitialized = true
  │
  ▼
ClientAppContent stops showing "Loading..." and renders Navbar + page
```

Why this dance? The access token is **deliberately not persisted** (localStorage is readable
by any injected script — XSS). Instead, on every full page load the app trades the HttpOnly
cookie for a fresh access token. The full-screen loader exists so a logged-in user never
sees a flash of the logged-out UI.

### 5.2 A complete request trace — the products page

Every arrow below is a line of code you can open. This is the pattern to internalize;
every other feature is a variation of it.

```
USER types "laptop" in the search box on /products
  │
  ▼  FRONTEND (ecommerce-frontend)
[1] products/page.js — setSearchInput("laptop")
[2] a debounce useEffect waits 400 ms of silence, then sets `search`
[3] the fetch useEffect runs:  api.get("/products", { params: { page, limit: 12, search, category } })
[4] lib/axios.js request interceptor attaches  Authorization: Bearer <token>  (if logged in)
  │
  ▼  HTTP     GET http://localhost:5000/api/products?page=1&limit=12&search=laptop
  │
  ▼  BACKEND (ecommerce-backend) — middleware chain in src/app.js
[5] CORS middleware allows the origin and credentials
[6] express.json() (no body on GET), cookieParser()
[7] route mount /api/products → src/routes/product.routes.js → router.get("/", getAll)   (public)
[8] controller src/controllers/product.controller.js — reads req.query, calls service
[9] service src/services/product.service.js:
      filter = { status: "active", name: { $regex: "laptop", $options: "i" } }
      Promise.all([ Product.find(filter).populate("category","name")
                       .sort({createdAt:-1}).skip(0).limit(12),
                    Product.countDocuments(filter) ])
  │
  ▼  MongoDB executes the query and count
  │
[10] controller wraps it:  sendSuccess(res, 200, "...", { products, pagination:{ total, page, limit, totalPages } })
  │
  ▼  HTTP 200   { "success": true, "message": "...", "data": { "products": [...], "pagination": {...} } }
  │
  ▼  FRONTEND again
[11] page.js:  setProducts(res.data.data.products); setPagination(res.data.data.pagination)
[12] React re-renders the grid; lib/pagination.js getPageNumbers() renders  ← 1 … 4 [5] 6 … 84 →
```

**Error path:** if anything throws in steps 8–10, `asyncHandler` catches it and forwards to
`src/middleware/error.middleware.js`, which responds with `{ success: false, message }` and
the right status code. On the frontend, the page's `catch` logs it and the `finally` clears
the loading spinner.

### 5.3 Checkout and payment — the most complex flow

Three parties participate: your frontend, your backend, and Stripe's servers.
The card number goes **only** to Stripe (via their iframe); your code never sees it.

```
 Browser (checkout/page.js)            Your backend                      Stripe
──────────────────────────────────────────────────────────────────────────────────
 user fills shipping address
 user types card into <CardElement>  ← this input is a Stripe-hosted iframe
 clicks "Pay"
   │
   │ 1. POST /api/payment/create-intent                   (protect: must be logged in)
   │        { items: [{ product, quantity }] }   ← NO price/amount from the browser
   ├──────────────────────────────▶ pyment.service.js
   │                                priceCartItems() → DB prices
   │                                creates PaymentIntent ─────▶  intent registered,
   │                                (server-computed cents,       clientSecret minted
   │                                 metadata.userId)
   │ 2. ◀── { clientSecret, totalPrice } ─────┘
   │
   │ 3. stripe.confirmCardPayment(clientSecret, { card: CardElement })
   ├────────────────────────────────────────────────────────────▶ charges the card
   │ 4. ◀────────────────────────────────── paymentIntent.status = "succeeded"
   │
   │ 5. POST /api/orders { items: [{ product, quantity }], address, paymentIntentId }
   ├──────────────────────────────▶ order.service.js
   │                                priceCartItems() again → prices + total
   │                                paymentIntents.retrieve() ──▶ verify: succeeded?
   │                                  amount_received === total?   amount? same user?
   │ 6. ◀── order created (unique paymentIntentId ⇒ one payment = one order)
   │
   ▼
 writeCart([])  →  cart badge drops to 0  →  success screen  →  /orders
```

Study this and you understand modern card payments. The two rules worth internalising:
**never let the browser tell you the price** (step 1 sends only ids and quantities), and
**never let the browser tell you the payment succeeded** (step 5 asks Stripe directly).
Remaining weakness: confirmation still happens on the request path rather than through a
`payment_intent.succeeded` **webhook** (§11, item 8).

### 5.4 Auth token lifecycle

```
register ─▶ verification email ─▶ /verify-email?token= ─▶ isVerified: true ─▶ login
login    ─▶ backend returns { accessToken, user } + sets HttpOnly refreshToken cookie
           accessToken → memory only (lib/axios.js)     user → localStorage
requests ─▶ interceptor adds  Authorization: Bearer <accessToken>
             protect middleware verifies JWT, loads user from DB → req.user
             adminOnly checks req.user.role === "admin"  (role is read LIVE from the DB,
             so demoting an admin takes effect immediately — good design)
401      ─▶ response interceptor tries POST /auth/refresh once, then replays the request
             (reads response.data.data.accessToken — the envelope has TWO levels of
              "data": axios's own, plus the API's { success, message, data })
logout   ─▶ POST /auth/logout → refreshToken nulled in the DB (server-side revocation)
             → cookie cleared → token wiped → redirect /login
```

---

## 6. Key Features Breakdown

### Authentication (register → verify → login → refresh → logout)
- **Backend:** `src/routes/auth.routes.js` → `src/controllers/auth.controller.js` → `src/services/auth.service.js`. Passwords hashed with a bcrypt `pre("save")` hook in `src/models/user.model.js` (cost 12). Two JWTs signed with **different secrets** (`JWT_SECRET`, `JWT_REFRESH_SECRET`); the refresh token is also stored on the user document so the server can invalidate it. Email verification token = `crypto.randomBytes(32)`.
- **Frontend:** `register/page.js` (live password-rules checklist, confirm-password), `login/page.js`, `check-email/page.js` (interstitial), `verify-email/page.js` (consumes the token, redirects to login after 3 s — note the `useRef` guard against React StrictMode double-effects).
- **Gap to know:** `isVerified` is never actually checked at login, so verification is currently cosmetic (§11).

### Product catalog (search / filter / sort / pagination)
- **Backend:** `src/services/product.service.js` — the one place with real query-building logic: regex name search, category/isFeatured/min-max price filters, a whitelisted `SORT_MAP` (never pass user input straight into `.sort()` — this is why), and skip/limit pagination with a capped `limit` of 100.
- **Frontend:** `products/page.js` — 400 ms debounced search, category pill filters (deep-linkable via `?category=`), page-number bar from `lib/pagination.js`. During refetch, the old grid stays visible at 50% opacity — a small but nice UX trick.

### Cart (client-side only)
- Lives entirely in `localStorage["cart"]` as `[{ product, quantity, name, price, image }]`. Written by `products/[id]/page.js`, managed by `cart/page.js`, cleared by checkout. The backend `Cart` model exists but has no routes — a deliberate simplification (and a good exercise: move it server-side yourself, §10 Phase 8+).
- **All access goes through `src/lib/cart.js`** — `readCart()`, `writeCart(items)`, `getCartCount()`. Nothing touches `localStorage["cart"]` directly any more. `writeCart` dispatches a `cartUpdated` event, which is what the Navbar badge listens for, so the count updates instantly instead of only on reload. (The Navbar *also* listens for the DOM `storage` event — that one only fires in **other** tabs, which is why it alone was never enough.)
- The stored `price` is for display only. Checkout sends the server just `{ product, quantity }`; the real price always comes from the database (§5.3).

### Checkout & payment
- `checkout/page.js` (372 lines — read it top to bottom once): address form state, Stripe `<Elements>`/`<CardElement>`, the 3-step sequence from §5.3, error display, success screen.

### Orders
- **User:** `POST /api/orders` (the server forces `user: req.user._id` — never trust the client to say who they are — and now also recomputes every price and verifies the Stripe payment before saving; the controller destructures only `items`, `address` and `paymentIntentId` instead of spreading `req.body`, so a client can't set its own `status` or `totalPrice`), `GET /api/orders/my-orders`, order list + detail pages with a status-color map.
- **Admin:** `GET /api/orders` (all orders), `PUT /api/orders/:id` for status changes via an inline `<select>` in `admin/orders/page.js`.

### Admin panel
- `admin/layout.js` — collapsible sidebar, mobile overlay, and the role guard: a `useEffect` that redirects non-admins. Client-side only, so the admin HTML flashes briefly for non-admins; real protection comes from `adminOnly` on the API (§11).
- `admin/page.js` — dashboard stats from `GET /api/dashboard` (MongoDB aggregation: `$sum` of order totals + counts).
- `admin/products/page.js` (498 lines, biggest file) — table, pagination (20/page), create-modal with slug auto-generation and multipart upload (currently broken, §11 #1). No edit UI yet despite the backend supporting `PUT`.
- `admin/categories/page.js` — recursive tree building for nested categories.

### Reviews (backend only)
- Full REST API at `/api/products/:id/reviews` (`review.routes.js` uses `Router({ mergeParams: true })` so it can read the product id from the parent route — a nested-router technique worth remembering). **No frontend UI consumes it** — building the review UI is a perfect first contribution (§10).

---

## 7. State Management

No Redux, no Zustand, no TanStack Query. Three deliberate layers instead:

| Layer | Where | What lives there | Why there |
|---|---|---|---|
| **React Context** | `src/context/AuthContext.js` | `user`, `loading`, `isInitialized`, plus `login()` / `register()` / `logout()` | Auth state is needed by nearly every page — Context makes it available everywhere without prop-drilling |
| **Module singleton** | `src/lib/axios.js` (`let _accessToken`) | The JWT access token | In memory only, on purpose: localStorage is readable by injected scripts (XSS). Trade-off: lost on refresh, so the boot-time silent refresh (§5.1) restores it |
| **localStorage** | browser | `user` (profile JSON, non-sensitive) and `cart` (the whole cart) | Survives refresh; fine for non-secret data |

Everything else — products, orders, form fields — is plain per-page `useState`, refetched on
every mount. There is **no client cache**: navigate away and back, and the page refetches.
That's simple and always-fresh, but wasteful; TanStack Query is the natural upgrade (§11).

One subtlety worth studying: `login()` in AuthContext returns `{ success, error }` objects
instead of throwing. The page then does `if (!result.success) setError(result.error)` —
a pattern that keeps error handling explicit and local to the form.

---

## 8. API Handling

### The one file to master: `ecommerce-frontend/src/lib/axios.js`

```
api = axios.create({ baseURL: NEXT_PUBLIC_API_URL, withCredentials: true })
        │
        ├── REQUEST interceptor    → attach Authorization: Bearer <in-memory token>
        │
        └── RESPONSE interceptor   → on 401 (and not already retried, and not the
                                     refresh/login endpoints themselves):
                                       1. POST /auth/refresh   (cookie goes along)
                                       2. store response.data.data.accessToken
                                       3. replay the original request with the new token
                                     if refresh fails OR returns no token
                                       → handleGlobalLogout()
                                       (clear token + user, hard-redirect to /login,
                                        with a guard against redirect loops)
```

The `_retry` flag on the request config is the classic trick that prevents an infinite
401 → refresh → 401 → refresh loop. Excluding `/auth/refresh` itself from the retry logic
prevents recursion. This file is small but is the single highest-value read in the frontend.

Two details in here are worth studying because they were real bugs (§11 items 2 and 3):

- **The double `.data`.** `response.data` is axios's body; the API's own envelope puts the
  payload under another `data`. So the token is at `response.data.data.accessToken`. Reading
  one level too high silently yields `undefined`, and — because the code then *stored* that
  `undefined` — it destroyed the working token and replayed everything as `Bearer undefined`.
  A failed refresh must be treated as a logout, never cached.
- **`_retry` cuts both ways.** It stops the infinite loop, but it also means a second 401
  skips the whole `catch` block. So if the refresh path can fail *without throwing*, you get a
  silently signed-out app with no redirect. Make every non-success path call
  `handleGlobalLogout()` explicitly.

*Known remaining limitation:* there is no single-flight guard, so N concurrent 401s fire N
refresh calls. Harmless here, but a refresh queue is the standard next step.

### Backend conventions

- **Success envelope:** `sendSuccess(res, statusCode, message, data)` → `{ success, message, data }` (`src/utils/apiResponse.js`). Frontend reads `res.data.data.<thing>` — the double `.data` is axios's `.data` plus the envelope's `data`.
- **Errors:** services `throw new ApiError(code, message)`; `asyncHandler` catches; `error.middleware.js` responds `{ success: false, message }` (+ stack trace outside production).
- **Where calls are made (frontend):** inline in each page's `useEffect` — there is no `services/` abstraction layer. Fine at this size; extract one when endpoints get reused.
- **Caching strategy:** none, anywhere — no HTTP cache headers, no client cache. Every mount refetches.
- **User-facing errors:** auth and checkout show inline messages; admin pages use `window.alert`/`window.confirm`; list pages mostly just `console.error`. A toast system is a cheap big win (§11).

---

## 9. Performance & Optimization

**What the project already does right:**

- **Server-side pagination** (12 per page public, 20 admin, `limit` capped at 100) — never ships the whole catalog to the browser.
- **400 ms search debounce** — one request per pause in typing, not per keystroke.
- **`Promise.all`** for parallel fetching (home page loads featured products + categories simultaneously; the service runs `find` + `countDocuments` in parallel).
- **`next/font`** self-hosted Geist fonts — no font-loading layout shift.
- **Route-level code splitting** — automatic with the App Router; each page ships its own JS.
- **Stale-while-refetching UX** — the product grid dims instead of unmounting during a refetch.

**What's missing (each one is a learning exercise):**

- **Everything is client-rendered.** 19/20 files are `"use client"` with `useEffect` fetching. The product list and detail pages have no user-specific data — they are ideal candidates for **React Server Components**: fetch in an async component on the server, ship HTML. Benefits: faster first paint, SEO, less client JS.
- **No `next/image`** — raw `<img>` tags mean no resizing, no lazy loading, no format optimization (the Next ESLint config even warns about this).
- **No `<Suspense>`/`loading.js`/`error.js`** route conventions — `useSearchParams()` without a Suspense boundary also triggers build warnings in modern Next.
- **No memoization** (`useMemo`/`useCallback`/`React.memo`) anywhere — not painful at this size, but know why you'd reach for it.
- **No DB indexes** beyond `unique` fields — the regex search does a collection scan; a MongoDB text index (or Atlas Search) is the fix at scale.
- **Unpaginated admin endpoints** — `GET /api/orders`, categories, and reviews return entire collections.

---

## 10. Step-by-Step Learning Plan

How to rebuild this project from scratch, in eight phases. For each phase: build it,
compare against the existing code, and only move on when the checkpoint works.
Backend first — the API is the foundation, and you can test it in Swagger/Postman
without any UI.

### Phase 1 — Backend foundation (Express + MongoDB)
**Build:** `server.js` + `app.js` skeleton, `.env` with `PORT` and `MONGO_URI`, `config/db.js`, then the User / Category / Product models.
**Study:** `server.js`, `src/config/db.js`, `src/models/*.js` — especially `product.model.js` (sub-schemas, enums, refs) and `user.model.js` (the `pre("save")` hash hook, `select: false`).
**Learn:** middleware order, schemas, embed-vs-reference (§4.2).
**Checkpoint:** server boots, connects to Mongo, `GET /` answers.

### Phase 2 — Authentication
**Build:** register/login/refresh/logout + the `protect` and `adminOnly` middleware, exactly in the routes → controller → service layering. Then add email verification with Nodemailer.
**Study:** `src/services/auth.service.js`, `src/middleware/auth.middleware.js`, `src/controllers/auth.controller.js` (the cookie helper at the top).
**Learn:** JWT access/refresh pairs, HttpOnly cookies, bcrypt, why the refresh token is also stored in the DB (server-side revocation).
**Checkpoint:** full auth round-trip in Swagger: register → login → call a protected route → refresh → logout.

### Phase 3 — Product & category CRUD + API docs
**Build:** the five product endpoints and five category endpoints with admin guards; add pagination/search/filter/sort to `GET /products`; document everything with `@swagger` blocks as you go.
**Study:** `src/services/product.service.js` (the filter builder is the meat), `src/routes/product.routes.js` (guard composition + swagger JSDoc).
**Learn:** query-building, `populate()`, whitelisting sort options, `mergeParams` nested routers (do reviews here too if you're moving fast).
**Checkpoint:** seed data (write your own mini-seeder — study `src/seeders/seed.js`), then page/search/filter through it in Swagger.

### Phase 4 — Orders, payments, dashboard
**Build:** order create/list/detail/status-update; Stripe `create-intent`; the dashboard aggregation.
**Study:** `src/services/order.service.js`, `src/services/pyment.service.js`, `src/controllers/dashboard.controller.js` (aggregation pipeline).
**Learn:** never trust client identity (`user: req.user._id`), PaymentIntents, `$sum` aggregations. Use Stripe test mode + card `4242 4242 4242 4242`.
**Checkpoint:** create an order via Swagger; see the numbers move on the dashboard endpoint.

### Phase 5 — Frontend foundation (Next.js + Tailwind + routing)
**Build:** `create-next-app`, Tailwind v4, the route skeleton (all pages as static placeholders), root layout with fonts, Navbar with `<Link>`s.
**Study:** `src/app/layout.js`, `src/app/globals.css` (Tailwind v4's CSS-first config), `src/app/components/Navbar.js`.
**Learn:** App Router conventions (folder = route, `[id]` = dynamic), layouts, `"use client"` vs server components.
**Checkpoint:** you can click through every route; navbar highlights the active one.

### Phase 6 — Auth on the frontend
**Build:** the axios instance with both interceptors, `AuthContext`, login/register/verify pages, the boot-time silent refresh, protected-route redirects.
**Study:** `src/lib/axios.js` line by line, `src/context/AuthContext.js`, `src/app/ClientAppContent.js` (the init gate).
**Learn:** interceptors, in-memory token strategy, `withCredentials`, the `_retry` pattern.
**Checkpoint:** login survives a hard refresh; a 401 on a protected page lands you on /login.

### Phase 7 — Catalog, cart, checkout
**Build:** home, products list (debounced search, filters, pagination UI), product detail, localStorage cart with navbar badge, checkout with Stripe Elements.
**Study:** `products/page.js` (debounce effect), `lib/pagination.js`, `lib/cart.js`, `cart/page.js`, `checkout/page.js` (the three-step payment sequence).
**Learn:** debouncing, deep-linkable filters via `useSearchParams`, `<Elements>`/`confirmCardPayment`, and the rule that makes checkout safe: **the browser sends ids and quantities, never prices**. Put every cart write behind one helper that also dispatches a `cartUpdated` event — if you sprinkle `localStorage.setItem` across five components, one of them will forget and the badge goes stale.
**Checkpoint:** full purchase with the test card, order visible in /orders. Then try to cheat: edit `localStorage.cart` prices in DevTools and confirm the charge is still the real total.

### Phase 8 — Admin panel
**Build:** admin layout with sidebar + role guard, dashboard stat cards, product/category/order management pages.
**Study:** `admin/layout.js` (guard + responsive sidebar), `admin/products/page.js`, `admin/categories/page.js` (`buildTree` recursion).
**Learn:** role-based UI, modal forms, recursive rendering — and the signed direct-to-Cloudinary upload flow (`src/lib/cloudinaryUpload.js` on the frontend + `src/routes/upload.routes.js` on the backend, explained in §3): understand *why* the signature exists before rebuilding it.
**Checkpoint:** create a product with images from the admin UI and see it live on /products.

**After the rebuild — stretch goals** (each fixes a real gap in this codebase): reviews UI,
server-side cart, forgot-password flow (the model fields already exist!), Stripe webhooks,
tests with Vitest + Supertest, then TypeScript.

---

## 11. Improvement Suggestions

Ranked: things that are actually broken → security issues → quality upgrades.
Fixing #1–#6 yourself is a better exercise than any tutorial.

### A. Broken functionality (fix first)

1. ~~**Admin product creation is broken end-to-end.**~~ **FIXED (2026-07-28):** images now upload directly from the browser to Cloudinary via a signed payload (see §3), and the product is created with plain JSON. New files: `ecommerce-backend/src/{routes,controllers,services}/upload.*` and `ecommerce-frontend/src/lib/cloudinaryUpload.js`. Deleting a product now also destroys its Cloudinary images (`deleteProduct` in `src/services/product.service.js`), the admin form enforces its 5-image gallery limit, and the file inputs reset after a save. The old `uploadOnCloudinary()` helper is now unused dead code.
2. ~~**Silent token refresh is broken by a response-shape mismatch.**~~ **FIXED (2026-07-28):** the interceptor destructured `response.data` instead of `response.data.data`, so it cached `undefined`, wiped the good in-memory token and replayed requests as `Bearer undefined` — and because `_retry` was already set, the retry 401'd without ever reaching the logout path. `ecommerce-frontend/src/lib/axios.js` now reads `response.data?.data?.accessToken`, treats a missing token as a failed refresh, and guards `originalRequest.url` with optional chaining so a network error can't throw a `TypeError` inside the interceptor.
3. ~~**Logout never clears the refresh token in the DB.**~~ **FIXED (2026-07-28):** the handler was declared `async (userId, res)`, so `asyncHandler`'s `fn(req, res, next)` bound the whole request object to `userId` and `User.findByIdAndUpdate` threw a `CastError` before the cookie could be cleared. Now `async (req, res)` + `logoutUser(req.user._id)` (`ecommerce-backend/src/controllers/auth.controller.js`). Verified: logout returns 200, clears the cookie, and a replayed pre-logout refresh cookie is rejected with "Invalid refresh token".
4. **`seed:bulk` fails out of the box** — it requires a "Mobile Phones" category (`src/seeders/seedBulk.js`) that `seed.js` never creates. Add it to `seed.js`.
5. **Admins can't see draft products** — the listing service hardcodes `status: "active"` (`src/services/product.service.js`), yet new products default to `draft`. Add an admin-only `status` query param.
6. ~~**Cart badge never updates live**~~ **FIXED (2026-07-28):** nothing dispatched `cartUpdated`, and the DOM `storage` event only fires in *other* tabs. All cart access now goes through the new `ecommerce-frontend/src/lib/cart.js` (`readCart` / `writeCart` / `getCartCount`), and `writeCart` dispatches `cartUpdated` on every write — so the five write sites can't drift out of sync again. `readCart` also returns `[]` on corrupt JSON, which previously crashed the Navbar on every page.

### B. Security (fix before any real deployment)

7. ~~**CORS allows every origin *with credentials***~~ **FIXED (2026-07-28):** the allow-list now lives in `ecommerce-backend/src/config/cors.js` (localhost + the two Vercel origins + `FRONTEND_URL`, read lazily because ESM import hoisting means `dotenv` may not have run at module-eval time). Requests with no `Origin` (curl/Postman/Swagger) still pass; anything else gets a 403 and a `console.warn`. **The allow-list alone was not enough:** `src/middleware/error.middleware.js` was reflecting *any* `req.headers.origin` back with `Allow-Credentials: true` on **every error response**, which bypassed the list entirely — it now checks `isOriginAllowed()` first. Verified with curl on both success and error routes.
8. ~~**Stripe amount is trusted from the client**~~ **FIXED (2026-07-28):** the browser now sends only `[{ product, quantity }]`. `priceCartItems()` in `src/services/product.service.js` is the single source of truth — it validates ids/quantities, merges duplicate lines, loads `status: "active"` products, applies `salePrice > 0 ? salePrice : price` (matching the frontend exactly), checks stock, and returns `amountInCents` via `Math.round` (the old `amount * 100` produced non-integer cents that Stripe rejects). Both `create-intent` and order creation call it, so they cannot disagree. Order creation additionally retrieves the PaymentIntent from Stripe and requires `status === "succeeded"`, `amount_received` equal to the recomputed total, and `metadata.userId` equal to the caller; `Order.paymentIntentId` is `unique + sparse` so one payment can only ever produce one order. Verified end-to-end with a confirmed test PaymentIntent: replay → 409, cross-user → 403, amount mismatch → 400, no payment at all → 400. **Still outstanding:** a `payment_intent.succeeded` **webhook** (so Stripe confirms the charge rather than the browser) and an idempotency key; stock is checked but never decremented.
9. **A GitHub personal-access token is embedded in `.git/config`** (the `origin` remote URL). Remove it (`git remote set-url`) and **revoke that token on GitHub** — treat it as leaked.
10. **Email verification isn't enforced** — `isVerified` is never checked at login. Decide the policy and enforce it in `loginUser`.
11. **Both JWTs live 7 days** — a stolen access token is valid for a week, which defeats the refresh-token design. Set the access token to ~15 min (and actually read `JWT_EXPIRES_IN`, which exists in `.env` but is ignored).
12. **No hardening middleware** — add `helmet`, `express-rate-limit` (at least on `/api/auth/*`), and a request-body validation layer (Zod or express-validator) so bad input is rejected before it reaches Mongoose.

### C. Quality & architecture upgrades

13. **Add a `.env.example` and a root README** — right now a fresh clone can't know which 13 backend + 2 frontend env vars are required. Cheapest possible improvement.
14. **Zero tests.** Start with Supertest against the auth and product endpoints (bugs #2/#3 above are exactly the kind of thing one integration test would have caught).
15. **Move data fetching into Server Components** for the public catalog pages, and adopt `next/image`, `loading.js`, and `error.js` (§9).
16. **Adopt TanStack Query** on the client for caching, deduping, and mutation states — it replaces most of the hand-written `useEffect` + loading-flag code.
17. **Extract shared UI** — one `components/` folder with Button/Card/Modal; unify the two divergent design systems (customer purple/blue vs admin violet/gray); add a toast system to replace `window.alert`.
18. **Clean up dead code** — the unused `Cart` model, `config/nodemailer.js`, `sendOrderEmail`, `sendError`, the committed temp image in `ecommerce-backend/public/temp/`, the `/forgot-password` link with no page (the User model already has the reset fields — build the flow instead of deleting the link!).
19. **Consistency passes** — rename `pyment.service.js` → `payment.service.js`, unify `*.route.js` vs `*.routes.js`, add a 404 catch-all after the route mounts, add pagination to the admin order list.
20. **Longer term:** TypeScript (start with the backend services), a server-side cart, request logging (`morgan`/`pino`), CI (GitHub Actions running lint + tests), and a real deployment story (the swagger config still points at `https://your-production-url.com`).

---

---

*Generated on 2026-07-28 from a full read of the codebase at commit `f4993d9`.*

*Updated 2026-07-28 after fixing §11 items 1, 2, 3, 6, 7 and 8 — image upload, token refresh,
logout, the cart badge, CORS, and the client-controlled Stripe amount. Items 4, 5 and 9–20
are still open.*
