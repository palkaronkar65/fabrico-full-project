# FABRICO — Full Project (Production‑ready README)

> Full MERN e‑commerce platform composed of three coordinated modules: **Admin**, **Customers (Users)** and **Delivery Partner (Rider)**. This README is written to be placed directly in your GitHub repository root.

---

## Project Snapshot

**Name:** Fabrico

**Description:** Fabrico is a full‑stack MERN (MongoDB, Express, React, Node) e‑commerce application that supports product variants, OTP/email authentication for customers, admin order management (including returns & cancellations), and a rider/ delivery partner app with live location tracking (Leaflet). Images are stored on Cloudinary. Payments use Razorpay (online) and COD. Email flows use Gmail SMTP (or a transactional provider).

**Repository layout (recommended)**
```
/fabrico
  /server               # Express API (Node.js)
    /controllers
    /models
    /routes
    /middlewares
    /utils
    server.js
  /client               # React (Vite) — storefront & auth
  /admin-client         # React (Vite) — admin panel
  /rider-client         # React (Vite) — delivery partner app
  /scripts              # seeds, helpers
  README.md
  package.json          # optional monorepo scripts
```

---

## Key Features

- Admin: product & variant CRUD, pincode management, order/payment/delivery/return/cancel flows, admin user settings (email/password), email verification.
- Customers: Browse & filter products, OTP email signup/login, cart, checkout (COD/Razorpay), order lifecycle & live tracking, cancel & return requests.
- Delivery Partner (Rider): Auth, select/assign pincodes, bucket list (orders to deliver), mark Out For Delivery / Delivered, pickup returns, live location sharing.
- Shared: Cloudinary for media, MongoDB for data, secure payment integration (Razorpay), email OTP/verification (Gmail/transactional provider), Leaflet-based live maps.

---

## Technology Stack (Global)

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS (recommended) or plain CSS
- **Realtime / Maps**: Leaflet (client-side). Optionally Socket.IO for real-time updates.
- **Payments**: Razorpay (UPI/online) + Cash On Delivery (COD) support
- **Storage**: Cloudinary (images)
- **Email**: Gmail SMTP (app password) or SendGrid/Mailgun for production
- **Auth**: OTP via email for users; traditional email/password for admin & riders with bcrypt hashed passwords
- **Geolocation**: Browser Geolocation API for rider; backend stores latest coordinates
- **Hosting**: Render / Railway / Heroku for backend, Vercel / Netlify for frontends

---

## Technology Breakdown — per Module

### 1) Admin Module

**Purpose:** Full management of products (and product variants), pincodes for delivery, orders, returns, cancellations, and admin credentials.

**Recommended Techs & Libraries:**
- Frontend: React (Vite), Tailwind CSS, react-hook-form for forms, axios for API calls
- Auth: email/password (bcrypt for hashing; JWT for session tokens or server sessions)
- File upload: Cloudinary widget or direct client→Cloudinary signed uploads
- UI: react-table (or headless UI) for order/product tables, react-toastify or react-hot-toast for notifications
- Additional: yup or zod for validation

**Key Backend Concerns:**
- CRUD controllers for Product/Variant
- Pincode model & validation at checkout
- Order admin endpoints to change payment/delivery/return/cancel statuses
- Email verification for admin login (optional gating)
- Role enforcement middleware (isAdmin)


### 2) Users (Customers) Module

**Purpose:** Allow customers to browse products, register/login using OTP via email, manage cart, checkout and track orders.

**Recommended Techs & Libraries:**
- Frontend: React (Vite), Zustand or Context API (cart & auth), react-router-dom
- UI/UX: Tailwind CSS, react-hook-form, react-phone-input-2 (optional), Leaflet for map
- OTP/Auth: Call `/api/auth/send-otp` and `/api/auth/verify-otp` — backend issues short-lived OTPs (stored hashed)
- Payment: Razorpay Web SDK for client checkout; backend creates Razorpay order
- Local persistence: localStorage for cart fallback (sync with server when logged in)

**Key Backend Concerns:**
- OTP generation & storage (hash OTP + expiry), rate limiting on OTP endpoints
- Checkout flow: validate pincode, create order, if Razorpay -> create order & respond with keys, listen for webhook/verify
- Order lifecycle endpoints and user-only access checks
- Return & Cancel endpoints with reason & images


### 3) Delivery Partner (Rider) Module

**Purpose:** Rider authentication, choose pincode(s), pick orders to add to bucket, mark delivery states, share live location, pickup returns.

**Recommended Techs & Libraries:**
- Frontend: React (Vite), Tailwind CSS, Leaflet, axios
- Auth: email/password or username/password (bcrypt + JWT)
- Location updates: browser geolocation -> `navigator.geolocation.watchPosition` or periodic `getCurrentPosition` and POST to `/api/rider/location`
- Backend: Rider model, RiderLocation collection (upsert latest per rider), endpoints for bucket operations

**Key Backend Concerns:**
- Efficient upsert for RiderLocation (indexed by riderId)
- Secure endpoints so only riders can update their own statuses
- Task assignment: either admin assigns orders to riders or riders pick from available orders filtered by pincode

---

## Database Schemas (Short Examples)

> These are simplified example shapes. Use Mongoose for implementation.

**User**
```js
{
  name: String,
  email: { type: String, unique: true },
  isVerified: Boolean,
  authType: 'otp' | 'password',
  cart: [{ variantId, qty }],
  createdAt: Date
}
```

**Admin**
```js
{ email, passwordHash, isVerified }
```

**Product**
```js
{ title, description, category, images: [String], variants: [VariantSchema], createdAt }
```

**Variant**
```js
{ sku, attributes: { size, color }, price, stock }
```

**Order**
```js
{ userId, items: [{ variantId, qty, price }], address, pincode, paymentMethod, paymentStatus, deliveryStatus, returnRequest: { status, reason }, timestamps }
```

**RiderLocation**
```js
{ riderId, coords: { lat, lng }, updatedAt }
```

---

## API Overview (Essential Endpoints)

**Auth**
- `POST /api/auth/send-otp` — body: { email } → email OTP
- `POST /api/auth/verify-otp` — body: { email, otp } → return auth token/session
- `POST /api/auth/login` — admin/rider login with password

**Products**
- `GET /api/products` — filters: q, category, minPrice, maxPrice
- `GET /api/products/:id`
- `POST /api/admin/products` — admin (multipart/image)
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/variants`
- `DELETE /api/admin/products/:id/variants/:variantId`

**Pincodes**
- `GET /api/admin/pincodes`
- `POST /api/admin/pincodes` — add allowed pincode

**Cart & Checkout**
- `POST /api/cart` — add/update cart item (auth)
- `POST /api/checkout` — create order; if Razorpay selected, backend creates order and returns order info

**Orders**
- `GET /api/orders` — user orders (auth)
- `GET /api/admin/orders` — admin view
- `PATCH /api/admin/orders/:id/status` — update delivery/payment/return/cancel
- `POST /api/orders/:id/cancel` — user cancel request
- `POST /api/orders/:id/return` — user return request

**Rider**
- `POST /api/rider/login`
- `POST /api/rider/location` — body: { lat, lng } — upsert
- `GET /api/rider/bucket` — list
- `PATCH /api/rider/orders/:id` — mark out/delivered/pickup

---

## Environment (.env) Example

Create `.env` inside `/server`:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fabrico
JWT_SECRET=supersecret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
GMAIL_USER=youremail@gmail.com
GMAIL_PASS=app_password_or_oauth_token
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
FRONTEND_URL=http://localhost:5173
```

> **Important:** Do not commit `.env` to Git. Use secrets manager on deployment platform.

---

## Setup & Local Development (Quick Start)

### Prerequisites
- Node.js (>=18 recommended), npm or yarn
- MongoDB (Atlas or local)
- Cloudinary account
- Razorpay test account

### Steps
1. Clone repository
```bash
git clone <your-repo-url>
cd fabrico
```
2. Backend
```bash
cd server
npm install
cp .env.example .env  # edit .env
npm run dev            # or nodemon server.js
```
3. Frontends (client, admin-client, rider-client)
```bash
cd ../client
npm install
npm run dev
# repeat for admin-client and rider-client
```
4. Seed an admin user and sample products
```bash
node scripts/seedAdmin.js
node scripts/seedProducts.js
```

---

## Deployment Tips
- Use managed MongoDB (Atlas) for production
- Store env variables in hosting platform (Render/Vercel/AWS)
- For frontends, deploy to Vercel or Netlify, and set `VITE_API_URL` to backend production URL
- For backend deployment: choose Render / Railway / Heroku (ensure region & envs configured)
- Use HTTPS to secure communication. For Razorpay, set webhook URL and verify signatures.

---

## Security Considerations
- Store password hashes with bcrypt (salt rounds >= 10)
- Hash and expire OTPs; rate-limit OTP endpoints
- Validate pincode at checkout to avoid fraudulent shipping
- Use HTTPS and secure cookies (if session-based auth)
- Keep Cloudinary and Razorpay credentials secret

---

## Testing & Validation
- Unit test critical controllers: auth, order creation, payment verification
- Manual: test end-to-end flows: OTP login, checkout COD, checkout Razorpay, order lifecycle, rider live tracking, return pickup
- Edge cases: insufficient stock for variants, invalid pincodes, duplicate OTP attempts

---

## Contributing Guide (Short)
1. Fork repo
2. Create feature branch
3. Run tests & linting
4. Open PR with description and testing steps

---

## License
MIT License — include `LICENSE` file if publishing publicly.

---

## Contact
**Author / Maintainer:** Harshal Ravindra Jadhav
- GitHub: https://github.com/codesbyharsh
- Email: jadhavh655@gmail.com

---

If you want, I can now:
- Generate a ready‑to‑paste `README.md` file per client (admin/client/rider) and add `ENV.example` and `seed` scripts, or
- Produce a full API reference (table with request/response examples) for the backend.

Tell me which one you want next and I will update this document accordingly.
