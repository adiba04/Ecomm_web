# E-Commerce App

Production-ready e-commerce application using Express + Angular with single-server deployment.

## Stack

- Backend: Node.js + Express + TypeScript + TypeORM + SQLite (`better-sqlite3`)
- Frontend: Angular + TypeScript + Plain CSS

## Structure

- `backend/`: API server, middleware, TypeORM datasource
- `frontend/`: Angular app source
- `backend/public/`: Angular production build output served by Express
- `package.json` (root): unified install/build/run scripts

## Angular Modules

- `Core`
- `Shared`
- `Auth`
- `Products`
- `Cart`
- `Orders`
- `Admin` (lazy loaded)

## Environment

1. Copy backend env:

```bash
cd backend
cp .env.example .env
```

2. Set the SQLite database file path in `backend/.env` (`DB_PATH`).

3. For local frontend/UI work without DB initialization, set `DB_REQUIRED=false`.
4. For first-time local DB setup, keep `DB_SYNCHRONIZE=true` to auto-create tables from entities.

## Install

```bash
cd /Users/neelx/Desktop/4x4/adiba/ecom
npm install
npm run install:all
```

## Development (two servers)

### Run both frontend + backend

```bash
cd /Users/neelx/Desktop/4x4/adiba/ecom
npm run dev
```

### Or run separately

### Backend

```bash
cd /Users/neelx/Desktop/4x4/adiba/ecom/backend
npm run dev
```

### Frontend

```bash
cd /Users/neelx/Desktop/4x4/adiba/ecom/frontend
npm start
```

## Production Build + Single Server Run

```bash
cd /Users/neelx/Desktop/4x4/adiba/ecom
npm run build
npm start
```

What happens in production mode:

- Angular builds to `backend/public/browser`
- Express serves `/api/*` for backend APIs
- Express serves static frontend from `backend/public/browser`
- Non-API routes fallback to Angular `index.html` (SPA routing)

## Implemented Features (Final Audit)

### Access Levels

- Guest: browse home/products/detail, search/filter, register/login, forgot/reset password
- Customer: cart, checkout, confirmation, order history + order detail, profile update, password change, logout
- Admin: lazy-loaded admin panel with product CRUD, customer lock/unlock, all orders + order detail

### Product Taxonomy

- Four-level hierarchy implemented with strict relationships:
	- Type -> Category -> Sub-Category -> Product
- Validation enforces correct parent-child mapping on product create/update.

### Security

- Password hashing via `bcrypt`
- TypeORM query builder/parameterized queries used (no string-concatenated SQL)
- Backend input validation/sanitization helpers on all major endpoints
- RBAC on protected APIs and Angular route guards (`AuthGuard`, `CustomerGuard`, `AdminGuard`)
- Cookie + server-side in-memory session `Map` checked on protected requests
- Immediate account-lock enforcement with session revocation
- Rate limiting on global and auth-sensitive endpoints
- CORS allowlist via configured frontend origins
- Global error handler avoids leaking internals

### Search, Filtering, Pagination

- Full-text style keyword search across product name + description
- Server-side filters: type, category, sub-category id, sub-category name, price range, stock status
- Server-side pagination (`page`, `limit`) on listings/search

### Cart, Checkout, Orders

- Persistent cart per customer account
- Quantity updates/removal and stock checks
- Checkout with payment method selection
- Order snapshot records item name/SKU/price at purchase time
- Confirmation page after successful checkout
- Customer order list + dedicated detail page

### Images

- Product images uploaded to `ProductImages/products`
- DB stores relative image path only
- Images served via Express static route: `/ProductImages/*`
- Default placeholder image shown when no product image is set

### Admin Panel

- Product management: list/create/update/delete
- Customer management: list + lock/unlock (immediate effect)
- Order management: list all + detail view

## Key Routes

- Frontend:
	- `/products`, `/products/:id`
	- `/cart`, `/checkout`, `/checkout/confirmation/:orderId`
	- `/orders`, `/orders/:orderId`
	- `/profile`
	- `/admin/products`, `/admin/customers`, `/admin/orders`, `/admin/orders/:orderId`
- API:
	- `/api/auth/*`, `/api/products`, `/api/products/:id`
	- `/api/cart/*`, `/api/orders/*`
	- `/api/admin/*`, `/api/taxonomy/*`

## Rubric Coverage Snapshot

- Database design: implemented with normalized entities + constraints
- Security controls: implemented (production must set secure cookie env correctly)
- Authentication/session/locking: implemented
- Forgot-password mock flow: implemented (code displayed + expiry)
- Taxonomy/search/filtering/pagination: implemented
- Cart/checkout/order history/detail: implemented
- Image handling/static serving/fallback: implemented
- Admin module and role protection: implemented
- Angular routing/lazy loading/guards/share button/profile/password: implemented

## Production Security Note

Set `SECURE_COOKIES=true` in production HTTPS deployments so auth cookies are always sent as Secure + HTTP-only.

## Notes

- SQLite connection is configured in `backend/src/config/data-source.ts`.
- API health endpoint: `GET /api/health`.
- Product images are served from `GET /ProductImages/*`.
# Ecomm
