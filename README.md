# E-Shopping

A full-stack e-commerce store: customers browse and search products, add them to a cart,
pay by card with Stripe, and track their orders. Admins get a separate dashboard for
managing products, categories and orders, plus revenue statistics.

**Live frontend:** https://e-shopping-two-zeta.vercel.app

> The deployed frontend is hosted on Vercel. The backend is run separately (see
> [Getting started](#getting-started)) — the committed `.env.local` points the frontend at
> `http://localhost:5000/api`, so a local backend is needed for the local dev setup.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Frontend routes](#frontend-routes)
- [Features](#features)
- [Third-party integrations](#third-party-integrations)
- [Scripts](#scripts)
- [Further reading](#further-reading)

---

## Architecture

Two independent applications in one repository — each with its own `package.json`,
its own `node_modules`, and its own process. A simple multi-app repo, no workspace tooling.

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

The backend follows a layered structure — **route → controller → service → model** — so
HTTP concerns, request handling and business rules stay separated.

---

## Tech stack

### Backend (`ecommerce-backend/`)

| Technology | Version | Role |
|---|---|---|
| Node.js + ES Modules | — | Runtime (`"type": "module"`, `import`/`export` everywhere) |
| Express | 5.2.1 | HTTP framework — routing and middleware |
| MongoDB + Mongoose | 9.6.2 | Database and ODM (schemas, validation, queries) |
| jsonwebtoken | 9.0.3 | Stateless auth — access and refresh JWTs |
| bcryptjs | 3.0.3 | Password hashing (cost factor 12) |
| cookie-parser | 1.4.7 | Reads the HttpOnly `refreshToken` cookie |
| cors | 2.8.6 | Cross-origin allow-list with credentials |
| dotenv | 17.4.2 | Loads `.env` into `process.env` |
| stripe | 22.3.0 | Server-side PaymentIntent creation |
| nodemailer | 9.0.3 | Account-verification email over Gmail SMTP |
| swagger-jsdoc + swagger-ui-express | 6.3.0 / 5.0.1 | Interactive API docs at `/api-docs` |
| nodemon (dev) | 3.1.14 | Restarts the server on change |

### Frontend (`ecommerce-frontend/`)

| Technology | Version | Role |
|---|---|---|
| Next.js (App Router) | 16.2.7 | File-system routing, bundling, dev server |
| React | 19.2.4 | UI components and hooks |
| Tailwind CSS | v4 | All styling; CSS-first config in `src/app/globals.css` (no `tailwind.config.js`) |
| axios | 1.17.0 | HTTP client with auth + 401-retry interceptors |
| lucide-react | 1.17.0 | Icon set |
| @stripe/stripe-js + @stripe/react-stripe-js | 9.9.0 / 6.7.0 | Stripe browser SDK and React bindings |

No TypeScript, no Redux/Zustand, no TanStack Query, no component library, no test
framework — the project stays on platform primitives.

---

## Repository layout

```
E-shopping/
├── ecommerce-backend/
│   ├── server.js                  # entry point — connect DB, then listen
│   └── src/
│       ├── app.js                 # Express app, Swagger, CORS, route mounting
│       ├── config/                # db, cors, stripe, nodemailer
│       ├── controllers/           # HTTP layer — parse request, send response
│       ├── services/              # business logic and DB access
│       ├── models/                # Mongoose schemas
│       ├── routes/                # route definitions + @swagger JSDoc
│       ├── middleware/            # auth (protect / adminOnly), error handler
│       ├── seeders/               # seed.js and seedBulk.js
│       └── utils/                 # apiError, apiResponse, asyncHandler, cloudinary, email
│
├── ecommerce-frontend/
│   └── src/
│       ├── app/                   # App Router pages
│       │   ├── admin/             # dashboard, products, categories, orders
│       │   ├── products/          # listing + [id] detail
│       │   ├── cart/  checkout/  orders/
│       │   ├── login/  register/  verify-email/  check-email/
│       │   └── components/Navbar.js
│       ├── context/AuthContext.js # auth state for the whole app
│       └── lib/                   # axios instance, cart, cloudinaryUpload, pagination
│
├── PROJECT_GUIDE.md               # in-depth walkthrough of the whole codebase
└── README.md
```

### Data models

`User`, `Category`, `Product`, `Order`, `Review`, `Cart` — defined in
`ecommerce-backend/src/models/`. Products reference a category; orders reference a user and
embed the purchased items and shipping address; reviews reference a product and a user.

---

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), and — for the full
feature set — Stripe test keys, a Gmail app password, and a Cloudinary account.

```bash
# Terminal 1 — backend
cd ecommerce-backend
npm install
# create .env (see below)
npm run seed        # admin user + 5 categories + 14 products
npm run dev         # http://localhost:5000

# Terminal 2 — frontend
cd ecommerce-frontend
npm install
# create .env.local (see below)
npm run dev         # http://localhost:3000
```

Seeded admin login: `admin@eshopping.com` / `Admin@123`
API docs: http://localhost:5000/api-docs

> Start the backend from inside `ecommerce-backend/`. Swagger scans `./src/routes/*.js`
> relative to the working directory, so running it from elsewhere produces empty docs.

---

## Environment variables

### `ecommerce-backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Server port (defaults to `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signs refresh tokens |
| `NODE_ENV` | `development` / `production` — controls cookie flags and error detail |
| `FRONTEND_URL` | Added to the CORS allow-list; used in verification email links |
| `BACKEND_URL` | Production server URL shown in the Swagger docs |
| `STRIPE_SECRET_KEY` | Server-side Stripe key |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address and app password for Nodemailer |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Signing direct browser uploads |

### `ecommerce-frontend/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable (browser-safe) key |

CORS allow-list lives in `ecommerce-backend/src/config/cors.js`. It already includes
`http://localhost:3000` and the Vercel deployment, and picks up `FRONTEND_URL` so a new
deploy needs no code change.

---

## API overview

Base path `/api`. `protect` = requires a valid access token, `admin` = admin role only.

| Method & path | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | — | Create account, send verification email |
| `POST /api/auth/login` | — | Return access token + set refresh cookie |
| `POST /api/auth/refresh` | cookie | Issue a new access token |
| `POST /api/auth/logout` | protect | Clear the refresh cookie |
| `GET /api/auth/verify-email` | — | Verify an account from the emailed token |
| `GET /api/products` | — | List with search, filter, sort, pagination |
| `GET /api/products/:id` | — | Single product |
| `POST /api/products` | admin | Create |
| `PUT /api/products/:id` | admin | Update |
| `DELETE /api/products/:id` | admin | Delete |
| `GET /api/categories` · `GET /api/categories/:id` | — | Read categories |
| `POST/PUT/DELETE /api/categories…` | admin | Manage categories |
| `POST /api/orders` | protect | Place an order |
| `GET /api/orders/my-orders` | protect | Current user's orders |
| `GET /api/orders/:id` | protect | Single order |
| `GET /api/orders` | admin | All orders |
| `PUT /api/orders/:id` · `DELETE /api/orders/:id` | admin | Update status / delete |
| `POST /api/payment/create-intent` | protect | Create a Stripe PaymentIntent |
| `GET/POST/DELETE /api/products/:id/reviews` | mixed | Product reviews |
| `GET /api/dashboard` | admin | Revenue and count statistics |
| `GET /api/uploads/signature` | admin | Signed params for direct Cloudinary upload |

Full interactive reference (33 documented operations): **http://localhost:5000/api-docs**

---

## Frontend routes

| Route | Description |
|---|---|
| `/` | Home |
| `/products` | Catalog with search, filter, sort, pagination |
| `/products/[id]` | Product detail |
| `/cart` | Cart (client-side, persisted in the browser) |
| `/checkout` | Address + Stripe card payment |
| `/orders` · `/orders/[id]` | Order history and detail |
| `/login` · `/register` | Authentication |
| `/check-email` · `/verify-email` | Email-verification flow |
| `/admin` | Dashboard statistics |
| `/admin/products` · `/admin/categories` · `/admin/orders` | Admin management |

---

## Features

- **Authentication** — register → email verification → login → silent refresh → logout.
  Access token in memory, refresh token in an HttpOnly cookie; `src/lib/axios.js`
  transparently retries a request once after refreshing on a 401.
- **Product catalog** — server-side search, category filter, sorting and pagination.
- **Cart** — client-side only, handled in `src/lib/cart.js`.
- **Checkout & payment** — Stripe Elements; card data goes straight to Stripe in an iframe
  and never reaches this codebase.
- **Orders** — customers see their own; admins see and update all.
- **Admin panel** — product CRUD with direct-to-Cloudinary image upload, category CRUD,
  order status management and revenue stats.
- **Reviews** — implemented on the backend; no frontend UI yet.

---

## Third-party integrations

**Stripe** — the secret key stays on the server, which creates a PaymentIntent and returns
a one-time `clientSecret`; the browser confirms the payment with it.

**Nodemailer + Gmail** — sends the account-verification email containing a link to
`${FRONTEND_URL}/verify-email?token=…`.

**Cloudinary (signed direct upload)** — the backend signs `{ folder, timestamp }` with the
API secret, the admin's browser uploads files straight to Cloudinary with that signature,
and only the resulting `{ url, public_id }` is posted back as JSON. Image bytes never pass
through the backend.

**Swagger / OpenAPI** — the spec is generated at runtime from `@swagger` JSDoc blocks in
the route files, so docs live next to the code they describe.

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm run seed` | Admin user + 5 categories + 14 products |
| `npm run seed:bulk` | Larger generated dataset |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Further reading

[PROJECT_GUIDE.md](PROJECT_GUIDE.md) is a long-form walkthrough of the whole codebase —
end-to-end request traces, the checkout and token-refresh flows, state management, a
phase-by-phase learning plan, and a list of known rough edges and improvement suggestions.
# E-Shopping

A full-stack e-commerce store: customers browse and search products, add them to a cart,
pay by card with Stripe, and track their orders. Admins get a separate dashboard for
managing products, categories and orders, plus revenue statistics.

**Live frontend:** https://e-shopping-two-zeta.vercel.app

> The deployed frontend is hosted on Vercel. The backend is run separately (see
> [Getting started](#getting-started)) — the committed `.env.local` points the frontend at
> `http://localhost:5000/api`, so a local backend is needed for the local dev setup.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Frontend routes](#frontend-routes)
- [Features](#features)
- [Third-party integrations](#third-party-integrations)
- [Scripts](#scripts)
- [Further reading](#further-reading)

---

## Architecture

Two independent applications in one repository — each with its own `package.json`,
its own `node_modules`, and its own process. A simple multi-app repo, no workspace tooling.

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

The backend follows a layered structure — **route → controller → service → model** — so
HTTP concerns, request handling and business rules stay separated.

---

## Tech stack

### Backend (`ecommerce-backend/`)

| Technology | Version | Role |
|---|---|---|
| Node.js + ES Modules | — | Runtime (`"type": "module"`, `import`/`export` everywhere) |
| Express | 5.2.1 | HTTP framework — routing and middleware |
| MongoDB + Mongoose | 9.6.2 | Database and ODM (schemas, validation, queries) |
| jsonwebtoken | 9.0.3 | Stateless auth — access and refresh JWTs |
| bcryptjs | 3.0.3 | Password hashing (cost factor 12) |
| cookie-parser | 1.4.7 | Reads the HttpOnly `refreshToken` cookie |
| cors | 2.8.6 | Cross-origin allow-list with credentials |
| dotenv | 17.4.2 | Loads `.env` into `process.env` |
| stripe | 22.3.0 | Server-side PaymentIntent creation |
| nodemailer | 9.0.3 | Account-verification email over Gmail SMTP |
| swagger-jsdoc + swagger-ui-express | 6.3.0 / 5.0.1 | Interactive API docs at `/api-docs` |
| nodemon (dev) | 3.1.14 | Restarts the server on change |

### Frontend (`ecommerce-frontend/`)

| Technology | Version | Role |
|---|---|---|
| Next.js (App Router) | 16.2.7 | File-system routing, bundling, dev server |
| React | 19.2.4 | UI components and hooks |
| Tailwind CSS | v4 | All styling; CSS-first config in `src/app/globals.css` (no `tailwind.config.js`) |
| axios | 1.17.0 | HTTP client with auth + 401-retry interceptors |
| lucide-react | 1.17.0 | Icon set |
| @stripe/stripe-js + @stripe/react-stripe-js | 9.9.0 / 6.7.0 | Stripe browser SDK and React bindings |

No TypeScript, no Redux/Zustand, no TanStack Query, no component library, no test
framework — the project stays on platform primitives.

---

## Repository layout

```
E-shopping/
├── ecommerce-backend/
│   ├── server.js                  # entry point — connect DB, then listen
│   └── src/
│       ├── app.js                 # Express app, Swagger, CORS, route mounting
│       ├── config/                # db, cors, stripe, nodemailer
│       ├── controllers/           # HTTP layer — parse request, send response
│       ├── services/              # business logic and DB access
│       ├── models/                # Mongoose schemas
│       ├── routes/                # route definitions + @swagger JSDoc
│       ├── middleware/            # auth (protect / adminOnly), error handler
│       ├── seeders/               # seed.js and seedBulk.js
│       └── utils/                 # apiError, apiResponse, asyncHandler, cloudinary, email
│
├── ecommerce-frontend/
│   └── src/
│       ├── app/                   # App Router pages
│       │   ├── admin/             # dashboard, products, categories, orders
│       │   ├── products/          # listing + [id] detail
│       │   ├── cart/  checkout/  orders/
│       │   ├── login/  register/  verify-email/  check-email/
│       │   └── components/Navbar.js
│       ├── context/AuthContext.js # auth state for the whole app
│       └── lib/                   # axios instance, cart, cloudinaryUpload, pagination
│
├── PROJECT_GUIDE.md               # in-depth walkthrough of the whole codebase
└── README.md
```

### Data models

`User`, `Category`, `Product`, `Order`, `Review`, `Cart` — defined in
`ecommerce-backend/src/models/`. Products reference a category; orders reference a user and
embed the purchased items and shipping address; reviews reference a product and a user.

---

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), and — for the full
feature set — Stripe test keys, a Gmail app password, and a Cloudinary account.

```bash
# Terminal 1 — backend
cd ecommerce-backend
npm install
# create .env (see below)
npm run seed        # admin user + 5 categories + 14 products
npm run dev         # http://localhost:5000

# Terminal 2 — frontend
cd ecommerce-frontend
npm install
# create .env.local (see below)
npm run dev         # http://localhost:3000
```

Seeded admin login: `admin@eshopping.com` / `Admin@123`
API docs: http://localhost:5000/api-docs

> Start the backend from inside `ecommerce-backend/`. Swagger scans `./src/routes/*.js`
> relative to the working directory, so running it from elsewhere produces empty docs.

---

## Environment variables

### `ecommerce-backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Server port (defaults to `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signs refresh tokens |
| `NODE_ENV` | `development` / `production` — controls cookie flags and error detail |
| `FRONTEND_URL` | Added to the CORS allow-list; used in verification email links |
| `BACKEND_URL` | Production server URL shown in the Swagger docs |
| `STRIPE_SECRET_KEY` | Server-side Stripe key |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address and app password for Nodemailer |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Signing direct browser uploads |

### `ecommerce-frontend/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable (browser-safe) key |

CORS allow-list lives in `ecommerce-backend/src/config/cors.js`. It already includes
`http://localhost:3000` and the Vercel deployment, and picks up `FRONTEND_URL` so a new
deploy needs no code change.

---

## API overview

Base path `/api`. `protect` = requires a valid access token, `admin` = admin role only.

| Method & path | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | — | Create account, send verification email |
| `POST /api/auth/login` | — | Return access token + set refresh cookie |
| `POST /api/auth/refresh` | cookie | Issue a new access token |
| `POST /api/auth/logout` | protect | Clear the refresh cookie |
| `GET /api/auth/verify-email` | — | Verify an account from the emailed token |
| `GET /api/products` | — | List with search, filter, sort, pagination |
| `GET /api/products/:id` | — | Single product |
| `POST /api/products` | admin | Create |
| `PUT /api/products/:id` | admin | Update |
| `DELETE /api/products/:id` | admin | Delete |
| `GET /api/categories` · `GET /api/categories/:id` | — | Read categories |
| `POST/PUT/DELETE /api/categories…` | admin | Manage categories |
| `POST /api/orders` | protect | Place an order |
| `GET /api/orders/my-orders` | protect | Current user's orders |
| `GET /api/orders/:id` | protect | Single order |
| `GET /api/orders` | admin | All orders |
| `PUT /api/orders/:id` · `DELETE /api/orders/:id` | admin | Update status / delete |
| `POST /api/payment/create-intent` | protect | Create a Stripe PaymentIntent |
| `GET/POST/DELETE /api/products/:id/reviews` | mixed | Product reviews |
| `GET /api/dashboard` | admin | Revenue and count statistics |
| `GET /api/uploads/signature` | admin | Signed params for direct Cloudinary upload |

Full interactive reference (33 documented operations): **http://localhost:5000/api-docs**

---

## Frontend routes

| Route | Description |
|---|---|
| `/` | Home |
| `/products` | Catalog with search, filter, sort, pagination |
| `/products/[id]` | Product detail |
| `/cart` | Cart (client-side, persisted in the browser) |
| `/checkout` | Address + Stripe card payment |
| `/orders` · `/orders/[id]` | Order history and detail |
| `/login` · `/register` | Authentication |
| `/check-email` · `/verify-email` | Email-verification flow |
| `/admin` | Dashboard statistics |
| `/admin/products` · `/admin/categories` · `/admin/orders` | Admin management |

---

## Features

- **Authentication** — register → email verification → login → silent refresh → logout.
  Access token in memory, refresh token in an HttpOnly cookie; `src/lib/axios.js`
  transparently retries a request once after refreshing on a 401.
- **Product catalog** — server-side search, category filter, sorting and pagination.
- **Cart** — client-side only, handled in `src/lib/cart.js`.
- **Checkout & payment** — Stripe Elements; card data goes straight to Stripe in an iframe
  and never reaches this codebase.
- **Orders** — customers see their own; admins see and update all.
- **Admin panel** — product CRUD with direct-to-Cloudinary image upload, category CRUD,
  order status management and revenue stats.
- **Reviews** — implemented on the backend; no frontend UI yet.

---

## Third-party integrations

**Stripe** — the secret key stays on the server, which creates a PaymentIntent and returns
a one-time `clientSecret`; the browser confirms the payment with it.

**Nodemailer + Gmail** — sends the account-verification email containing a link to
`${FRONTEND_URL}/verify-email?token=…`.

**Cloudinary (signed direct upload)** — the backend signs `{ folder, timestamp }` with the
API secret, the admin's browser uploads files straight to Cloudinary with that signature,
and only the resulting `{ url, public_id }` is posted back as JSON. Image bytes never pass
through the backend.

**Swagger / OpenAPI** — the spec is generated at runtime from `@swagger` JSDoc blocks in
the route files, so docs live next to the code they describe.

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm run seed` | Admin user + 5 categories + 14 products |
| `npm run seed:bulk` | Larger generated dataset |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Further reading

[PROJECT_GUIDE.md](PROJECT_GUIDE.md) is a long-form walkthrough of the whole codebase —
end-to-end request traces, the checkout and token-refresh flows, state management, a
phase-by-phase learning plan, and a list of known rough edges and improvement suggestions.
# E-Shopping

A full-stack e-commerce store: customers browse and search products, add them to a cart,
pay by card with Stripe, and track their orders. Admins get a separate dashboard for
managing products, categories and orders, plus revenue statistics.

**Live frontend:** https://e-shopping-two-zeta.vercel.app

> The deployed frontend is hosted on Vercel. The backend is run separately (see
> [Getting started](#getting-started)) — the committed `.env.local` points the frontend at
> `http://localhost:5000/api`, so a local backend is needed for the local dev setup.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Frontend routes](#frontend-routes)
- [Features](#features)
- [Third-party integrations](#third-party-integrations)
- [Scripts](#scripts)
- [Further reading](#further-reading)

---

## Architecture

Two independent applications in one repository — each with its own `package.json`,
its own `node_modules`, and its own process. A simple multi-app repo, no workspace tooling.

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

The backend follows a layered structure — **route → controller → service → model** — so
HTTP concerns, request handling and business rules stay separated.

---

## Tech stack

### Backend (`ecommerce-backend/`)

| Technology | Version | Role |
|---|---|---|
| Node.js + ES Modules | — | Runtime (`"type": "module"`, `import`/`export` everywhere) |
| Express | 5.2.1 | HTTP framework — routing and middleware |
| MongoDB + Mongoose | 9.6.2 | Database and ODM (schemas, validation, queries) |
| jsonwebtoken | 9.0.3 | Stateless auth — access and refresh JWTs |
| bcryptjs | 3.0.3 | Password hashing (cost factor 12) |
| cookie-parser | 1.4.7 | Reads the HttpOnly `refreshToken` cookie |
| cors | 2.8.6 | Cross-origin allow-list with credentials |
| dotenv | 17.4.2 | Loads `.env` into `process.env` |
| stripe | 22.3.0 | Server-side PaymentIntent creation |
| nodemailer | 9.0.3 | Account-verification email over Gmail SMTP |
| swagger-jsdoc + swagger-ui-express | 6.3.0 / 5.0.1 | Interactive API docs at `/api-docs` |
| nodemon (dev) | 3.1.14 | Restarts the server on change |

### Frontend (`ecommerce-frontend/`)

| Technology | Version | Role |
|---|---|---|
| Next.js (App Router) | 16.2.7 | File-system routing, bundling, dev server |
| React | 19.2.4 | UI components and hooks |
| Tailwind CSS | v4 | All styling; CSS-first config in `src/app/globals.css` (no `tailwind.config.js`) |
| axios | 1.17.0 | HTTP client with auth + 401-retry interceptors |
| lucide-react | 1.17.0 | Icon set |
| @stripe/stripe-js + @stripe/react-stripe-js | 9.9.0 / 6.7.0 | Stripe browser SDK and React bindings |

No TypeScript, no Redux/Zustand, no TanStack Query, no component library, no test
framework — the project stays on platform primitives.

---

## Repository layout

```
E-shopping/
├── ecommerce-backend/
│   ├── server.js                  # entry point — connect DB, then listen
│   └── src/
│       ├── app.js                 # Express app, Swagger, CORS, route mounting
│       ├── config/                # db, cors, stripe, nodemailer
│       ├── controllers/           # HTTP layer — parse request, send response
│       ├── services/              # business logic and DB access
│       ├── models/                # Mongoose schemas
│       ├── routes/                # route definitions + @swagger JSDoc
│       ├── middleware/            # auth (protect / adminOnly), error handler
│       ├── seeders/               # seed.js and seedBulk.js
│       └── utils/                 # apiError, apiResponse, asyncHandler, cloudinary, email
│
├── ecommerce-frontend/
│   └── src/
│       ├── app/                   # App Router pages
│       │   ├── admin/             # dashboard, products, categories, orders
│       │   ├── products/          # listing + [id] detail
│       │   ├── cart/  checkout/  orders/
│       │   ├── login/  register/  verify-email/  check-email/
│       │   └── components/Navbar.js
│       ├── context/AuthContext.js # auth state for the whole app
│       └── lib/                   # axios instance, cart, cloudinaryUpload, pagination
│
├── PROJECT_GUIDE.md               # in-depth walkthrough of the whole codebase
└── README.md
```

### Data models

`User`, `Category`, `Product`, `Order`, `Review`, `Cart` — defined in
`ecommerce-backend/src/models/`. Products reference a category; orders reference a user and
embed the purchased items and shipping address; reviews reference a product and a user.

---

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), and — for the full
feature set — Stripe test keys, a Gmail app password, and a Cloudinary account.

```bash
# Terminal 1 — backend
cd ecommerce-backend
npm install
# create .env (see below)
npm run seed        # admin user + 5 categories + 14 products
npm run dev         # http://localhost:5000

# Terminal 2 — frontend
cd ecommerce-frontend
npm install
# create .env.local (see below)
npm run dev         # http://localhost:3000
```

Seeded admin login: `admin@eshopping.com` / `Admin@123`
API docs: http://localhost:5000/api-docs

> Start the backend from inside `ecommerce-backend/`. Swagger scans `./src/routes/*.js`
> relative to the working directory, so running it from elsewhere produces empty docs.

---

## Environment variables

### `ecommerce-backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Server port (defaults to `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signs refresh tokens |
| `NODE_ENV` | `development` / `production` — controls cookie flags and error detail |
| `FRONTEND_URL` | Added to the CORS allow-list; used in verification email links |
| `BACKEND_URL` | Production server URL shown in the Swagger docs |
| `STRIPE_SECRET_KEY` | Server-side Stripe key |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address and app password for Nodemailer |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Signing direct browser uploads |

### `ecommerce-frontend/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable (browser-safe) key |

CORS allow-list lives in `ecommerce-backend/src/config/cors.js`. It already includes
`http://localhost:3000` and the Vercel deployment, and picks up `FRONTEND_URL` so a new
deploy needs no code change.

---

## API overview

Base path `/api`. `protect` = requires a valid access token, `admin` = admin role only.

| Method & path | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | — | Create account, send verification email |
| `POST /api/auth/login` | — | Return access token + set refresh cookie |
| `POST /api/auth/refresh` | cookie | Issue a new access token |
| `POST /api/auth/logout` | protect | Clear the refresh cookie |
| `GET /api/auth/verify-email` | — | Verify an account from the emailed token |
| `GET /api/products` | — | List with search, filter, sort, pagination |
| `GET /api/products/:id` | — | Single product |
| `POST /api/products` | admin | Create |
| `PUT /api/products/:id` | admin | Update |
| `DELETE /api/products/:id` | admin | Delete |
| `GET /api/categories` · `GET /api/categories/:id` | — | Read categories |
| `POST/PUT/DELETE /api/categories…` | admin | Manage categories |
| `POST /api/orders` | protect | Place an order |
| `GET /api/orders/my-orders` | protect | Current user's orders |
| `GET /api/orders/:id` | protect | Single order |
| `GET /api/orders` | admin | All orders |
| `PUT /api/orders/:id` · `DELETE /api/orders/:id` | admin | Update status / delete |
| `POST /api/payment/create-intent` | protect | Create a Stripe PaymentIntent |
| `GET/POST/DELETE /api/products/:id/reviews` | mixed | Product reviews |
| `GET /api/dashboard` | admin | Revenue and count statistics |
| `GET /api/uploads/signature` | admin | Signed params for direct Cloudinary upload |

Full interactive reference (33 documented operations): **http://localhost:5000/api-docs**

---

## Frontend routes

| Route | Description |
|---|---|
| `/` | Home |
| `/products` | Catalog with search, filter, sort, pagination |
| `/products/[id]` | Product detail |
| `/cart` | Cart (client-side, persisted in the browser) |
| `/checkout` | Address + Stripe card payment |
| `/orders` · `/orders/[id]` | Order history and detail |
| `/login` · `/register` | Authentication |
| `/check-email` · `/verify-email` | Email-verification flow |
| `/admin` | Dashboard statistics |
| `/admin/products` · `/admin/categories` · `/admin/orders` | Admin management |

---

## Features

- **Authentication** — register → email verification → login → silent refresh → logout.
  Access token in memory, refresh token in an HttpOnly cookie; `src/lib/axios.js`
  transparently retries a request once after refreshing on a 401.
- **Product catalog** — server-side search, category filter, sorting and pagination.
- **Cart** — client-side only, handled in `src/lib/cart.js`.
- **Checkout & payment** — Stripe Elements; card data goes straight to Stripe in an iframe
  and never reaches this codebase.
- **Orders** — customers see their own; admins see and update all.
- **Admin panel** — product CRUD with direct-to-Cloudinary image upload, category CRUD,
  order status management and revenue stats.
- **Reviews** — implemented on the backend; no frontend UI yet.

---

## Third-party integrations

**Stripe** — the secret key stays on the server, which creates a PaymentIntent and returns
a one-time `clientSecret`; the browser confirms the payment with it.

**Nodemailer + Gmail** — sends the account-verification email containing a link to
`${FRONTEND_URL}/verify-email?token=…`.

**Cloudinary (signed direct upload)** — the backend signs `{ folder, timestamp }` with the
API secret, the admin's browser uploads files straight to Cloudinary with that signature,
and only the resulting `{ url, public_id }` is posted back as JSON. Image bytes never pass
through the backend.

**Swagger / OpenAPI** — the spec is generated at runtime from `@swagger` JSDoc blocks in
the route files, so docs live next to the code they describe.

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with node |
| `npm run seed` | Admin user + 5 categories + 14 products |
| `npm run seed:bulk` | Larger generated dataset |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Further reading

[PROJECT_GUIDE.md](PROJECT_GUIDE.md) is a long-form walkthrough of the whole codebase —
end-to-end request traces, the checkout and token-refresh flows, state management, a
phase-by-phase learning plan, and a list of known rough edges and improvement suggestions.
