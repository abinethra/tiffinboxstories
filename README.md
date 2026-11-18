# Tiffinbox Stories

A full-stack delivery-only cloud kitchen web application (*"Food that feels like home"*) serving home-style Tamil Nadu & South Indian tiffin meals with regional cook stories, weekly & monthly subscriptions, checkout & order tracking, and a JWT-protected kitchen admin portal.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas via Mongoose (auto-seeded on first connection with 23 tiffin dishes)
- **Auth & Security:** JWT (`jsonwebtoken`) + `bcryptjs` password hashing + server-side validation & price verification

## Folder Structure

```
.
├── server/
│   ├── auth.ts                 # JWT signing & requireAdmin middleware
│   ├── db.ts                   # Mongoose connection to MongoDB Atlas + seed logic
│   ├── models.ts               # Mongoose schemas & models (MenuItem, Order, Contact, Admin, Counter)
│   ├── routes.ts               # Public & admin REST API endpoints
│   ├── types.ts                # Shared backend TypeScript types
│   └── validation.ts           # Request payload validators
├── src/
│   ├── assets/images/          # Generated South Indian dish photography
│   ├── components/             # Navbar, Footer, DishCard, DishImage
│   ├── context/                # CartContext (persistent localStorage bag)
│   ├── data/                   # Subscription plans, delivery areas, reviews
│   ├── lib/                    # Typed REST API client (src/lib/api.ts)
│   ├── pages/                  # Home, Menu, Stories, Cart/Checkout, Plans, About, Admin
│   ├── types/                  # Frontend TypeScript types
│   ├── App.tsx                 # Client router, SEO metadata, layout shell
│   ├── index.css               # Tailwind v4 theme tokens (turmeric, terracotta, cream)
│   └── main.tsx                # React mount point
├── server.ts                   # Express + Vite dev/prod server entry point
├── .env.example                # Environment variable template
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` (or configure via AI Studio Secrets) and set:

| Variable | Description | Default |
| --- | --- | --- |
| `MONGODB_URL` | MongoDB Atlas connection string (`mongodb+srv://...`) | *(Required)* |
| `MONGODB_DB_NAME` | Target MongoDB database name | `tiffinbox_stories` |
| `PORT` | HTTP port for Express & Vite | `3000` |
| `JWT_SECRET` | Secret key used to sign admin JWT tokens | `tiffinbox-stories-dev-secret-change-in-production` |
| `ADMIN_EMAIL` | Seeded kitchen admin email | `admin@tiffinboxstories.in` |
| `ADMIN_PASSWORD` | Seeded kitchen admin password | `tiffin-kitchen-2026` |

## Setup & Run Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server (Express API + Vite frontend on port 3000)**
   ```bash
   npm run dev
   ```

3. **Type-check & build for production**
   ```bash
   npm run lint
   npm run build
   ```

4. **Start production server**
   ```bash
   NODE_ENV=production npm start
   ```

## REST API Reference

- `GET /api/health` — Server and MongoDB Atlas connection status
- `GET /api/menu` — List available dishes (supports `?dietary=veg|non-veg&mealType=Breakfast|Lunch|Dinner&q=...`)
- `POST /api/orders` — Validate customer details, compute total server-side, and persist an order in MongoDB
- `GET /api/orders/:id` — Fetch order receipt and preparation status (e.g., `TBS-1001`)
- `POST /api/contact` — Save a customer enquiry or subscription request in MongoDB
- `POST /api/admin/login` — Authenticate kitchen admin and return JWT
- `GET /api/admin/orders` — *(Protected)* List all orders and contact enquiries
- `PATCH /api/admin/orders/:id` — *(Protected)* Update order status
- `POST /api/admin/menu` — *(Protected)* Add a new menu item
- `PUT /api/admin/menu/:id` — *(Protected)* Update an existing menu item
- `DELETE /api/admin/menu/:id` — *(Protected)* Delete a menu item
