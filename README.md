# Refresh Breeze - Official Website

Website resmi grup idola **Refresh Breeze** dengan desain premium glassmorphism, arsitektur modular, dan fitur lengkap.

## 🌊 Teknologi yang Digunakan

### Backend

- **Node.js** & **Express.js** - Server framework
- **Supabase (PostgreSQL)** - Database
- **JWT** - Authentication
- **Midtrans** - Payment gateway (Sandbox)
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - API protection

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Glassmorphism design dengan CSS Variables
- **Vanilla JavaScript** - Modular architecture
- **Google Fonts (Inter)** - Typography

## 📁 Struktur Proyek

```
refresh-breeze/
├── backend/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── database.js        # Supabase connection
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── errorHandler.js    # Error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── sanitize.js        # Input sanitization
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication endpoints
│   │   ├── memberRoutes.js    # Member endpoints
│   │   ├── productRoutes.js   # Product endpoints
│   │   ├── orderRoutes.js     # Order endpoints
│   │   └── scheduleRoutes.js  # Schedule endpoints
│   └── controllers/
│       ├── authController.js
│       ├── memberController.js
│       ├── productController.js
│       ├── orderController.js
│       └── scheduleController.js
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js             # API communication
│   │   ├── auth.js            # Authentication logic
│   │   ├── cart.js            # Shopping cart
│   │   └── script.js          # Main application
│   └── assets/
│       └── images/            # Member photos & assets
└── database/
    └── schema.sql             # Database schema
```

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
cd c:\Githab\remake
```

### 2. Setup Database (Supabase)

1. Buat akun di [https://supabase.com](https://supabase.com)
2. Buat project baru
3. Jalankan SQL schema dari `database/schema.sql` di SQL Editor Supabase
4. Copy **Project URL** dan **Anon Key** dari Settings > API

### 3. Setup Midtrans (Sandbox)

1. Daftar di [https://dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Pilih **Sandbox** environment
3. Copy **Server Key** dan **Client Key** dari Settings > Access Keys

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env file dengan kredensial Anda:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - JWT_SECRET (buat random string)
# - MIDTRANS_SERVER_KEY
# - MIDTRANS_CLIENT_KEY
```

Edit file `.env`:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

JWT_SECRET=your_super_secret_jwt_key_here

MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false

FRONTEND_URL=http://localhost:5500
```

### 5. Start Backend Server

```bash
cd backend
npm start
```

Server akan berjalan di `http://localhost:3000`

### 6. Start Frontend

Gunakan Live Server atau tool sejenis:

```bash
cd frontend
# Gunakan vscode live server atau
npx live-server
```

Frontend akan berjalan di `http://localhost:5500`

## 🎨 Fitur Utama

### 1. **Homepage Modern**

- Hero slider auto-advance dengan 3 slides
- About Us section
- Latest News cards
- Glassmorphism design effect

### 2. **Member Profiles**

- 7 member dengan placeholder data
- Interactive member cards
- Modal dengan bio lengkap
- Member color theming

### 3. **Event Schedule**

- Kalender event upcoming
- Featured events
- Filter by month (API ready)

### 4. **Fan Corner**

- Konten eksklusif dari member
- Blog posts
- Member-specific content

### 5. **Online Shop**

- Kategori: Cheki & Goods
- Shopping cart dengan UI modern
- Stock management
- Midtrans payment integration

### 6. **Authentication**

- Register & Login dengan JWT
- Password hashing dengan bcrypt
- Protected routes
- Session management

### 7. **Security Features**

- Input sanitization (XSS prevention)
- Rate limiting (API protection)
- Helmet security headers
- CORS configuration

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

### Members

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Filter by category

### Orders

- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)
- `POST /api/orders/payment-callback` - Midtrans webhook

### Schedule

- `GET /api/schedule` - Get upcoming events
- `GET /api/schedule/featured` - Get featured events
- `GET /api/schedule/month/:month` - Get events by month

## 🎨 Kustomisasi Warna

Edit CSS variables di `frontend/css/style.css`:

```css
:root {
  --primary-cyan: #00ced1;
  --sky-blue: #87ceeb;
  --soft-mint: #98d8c8;
  /* dst... */
}
```

## 📸 Mengganti Placeholder Images

1. Siapkan foto member (format: JPG/PNG, ratio 3:4)
2. Upload ke `frontend/assets/images/`
3. Update path di database atau langsung di kode

## 🐛 Troubleshooting

### Database Connection Failed

- Pastikan Supabase credentials benar di `.env`
- Cek database schema sudah dijalankan
- Periksa koneksi internet

### CORS Error

- Pastikan `FRONTEND_URL` di backend `.env` sesuai dengan URL frontend Anda
- Periksa browser console untuk detail error

### Payment Failed

- Pastikan menggunakan Midtrans **Sandbox** mode
- Gunakan test card numbers dari Midtrans documentation
- Cek Midtrans dashboard untuk status transaksi

## 📝 Development Notes

- **Backend Port**: 3000
- **Frontend Port**: 5500 (or any)
- **Database**: PostgreSQL via Supabase
- **Payment**: Midtrans Sandbox
- **Environment**: Development

## 🚀 Production Deployment

### Backend (Heroku/Railway/Vercel)

1. Set environment variables
2. Change `MIDTRANS_IS_PRODUCTION=true`
3. Update production Midtrans keys
4. Deploy

### Frontend (Netlify/Vercel)

1. Update API_BASE_URL di `frontend/js/api.js`
2. Deploy frontend files

## 📧 Support

Untuk pertanyaan atau bantuan, silakan hubungi developer.

---

**Built with ❤️ for Refresh Breeze**
