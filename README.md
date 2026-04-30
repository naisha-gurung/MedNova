# MedNova — Hospital Management System

A full-stack, production-grade Hospital Management System built with React.js, Node.js, Express, and MongoDB.

---

## 🏥 Features at a Glance

| Module | Description |
|---|---|
| **Auth** | JWT + Google OAuth, Role-based access (6 roles) |
| **Dashboard** | Live stats, charts, bed occupancy, revenue |
| **Appointments** | Slot-based booking, no double-booking, payment confirmation |
| **Doctors** | Searchable directory with fees & specializations |
| **OPD** | Outpatient records with vitals tracking |
| **IPD** | Inpatient records + visual bed map with real-time availability |
| **Prescriptions** | Inventory-linked medicines + external medicine option |
| **Inventory** | Stock tracking, low-stock alerts, expiry warnings |
| **Users** | Admin CRUD for all users with role management |
| **Profile** | Photo upload, vitals, password change |

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite, React Router v6, Recharts, React Hot Toast
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JWT + Google OAuth 2.0 (`@react-oauth/google`)
- **File Upload**: Multer (local storage, cloud-ready)
- **Styling**: Pure CSS with CSS custom properties (no UI library)

---

## 👤 User Roles & Access

| Role | Dashboard | Appointments | OPD | IPD | Prescriptions | Inventory | Users |
|---|---|---|---|---|---|---|---|
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Doctor** | ✅ | ✅ Write | ✅ Write | ✅ Write | ✅ Write | 👁 Read | ❌ |
| **Nurse** | ✅ | ✅ Write | ✅ Write | ✅ Write | ✅ Write | 👁 Read | ❌ |
| **Pharmacist** | ✅ | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ✅ Write | ❌ |
| **Receptionist** | ✅ | ✅ Book | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ❌ |
| **Patient** | ✅ | ✅ Own only | ❌ | ❌ | 👁 Own only | ❌ | ❌ |
| **Worker** | ✅ | 👁 Read | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ❌ |

---

## 📁 Project Structure

```
mednova/
├── server/                   # Node.js + Express backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── appointmentsController.js
│   │   ├── inventoryController.js
│   │   ├── prescriptionsController.js
│   │   ├── opdController.js
│   │   └── ipdController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect + RBAC authorize
│   │   └── upload.js         # Multer file upload
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Inventory.js
│   │   ├── Prescription.js
│   │   ├── OPD.js
│   │   └── IPD.js            # (includes Bed model)
│   ├── routes/               # Express routers
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── appointments.js
│   │   ├── inventory.js
│   │   ├── prescriptions.js
│   │   ├── opd.js
│   │   ├── ipd.js
│   │   ├── doctors.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── seed.js           # Database seeder
│   ├── uploads/              # Auto-created for profile pictures
│   ├── index.js              # Server entry point
│   ├── .env.example
│   └── package.json
│
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Topbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state + RBAC helper
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── DoctorsPage.jsx
│   │   │   ├── OPDPage.jsx
│   │   │   ├── IPDPage.jsx
│   │   │   ├── PrescriptionsPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── utils/
│   │   │   ├── api.js            # Axios instance + interceptors
│   │   │   └── helpers.js        # Formatters, constants
│   │   ├── App.jsx               # Router + Protected routes
│   │   ├── main.jsx
│   │   └── index.css             # Full design system
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── req/                      # Placeholder folder for assets/icons
├── package.json              # Root monorepo scripts
└── README.md
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd mednova

# Install all dependencies
npm run install:all
# OR manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mednova
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client** — copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Seed the Database

```bash
npm run seed
```

This creates sample users, 12 medicines, and 30 beds.

### 4. Run Development Servers

```bash
# Run both frontend and backend simultaneously
npm run dev

# OR separately:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:3000
```

---

## 🔑 Demo Login Credentials

All accounts use password: **`password123`**

| Role | Email |
|---|---|
| Admin | admin@mednova.com |
| Doctor (Cardiology) | doctor1@mednova.com |
| Doctor (Orthopedics) | doctor2@mednova.com |
| Nurse | nurse@mednova.com |
| Pharmacist | pharmacist@mednova.com |
| Receptionist | receptionist@mednova.com |
| Worker | worker@mednova.com |
| Patient | patient@mednova.com |

---

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add `http://localhost:3000` to Authorized JavaScript origins
5. Copy Client ID to both `.env` files

---

## 🏗 Key Design Decisions

### No Double Booking
Appointments enforce uniqueness at the database level via a compound index on `(doctor, date, timeSlot)`. The API also checks in-memory before attempting insertion.

### Bed Allocation
Before admitting a patient, the backend verifies the selected bed is unoccupied. Upon discharge, the bed is automatically freed in the same transaction.

### Payment System
A placeholder payment flow is implemented: booking creates a `pending` appointment → "Pay & Book" triggers `/appointments/:id/pay` which sets `paymentStatus: 'paid'` and `status: 'confirmed'`. Replace this endpoint with Razorpay/Stripe when ready.

### Prescription Medicines
- **From Inventory**: Linked to actual stock (dropdown from inventory collection)
- **Other Medicine** (visually distinct with amber tag): `isExternal: true`, free-text name, not deducted from stock

### Profile Picture Upload
Files are stored in `server/uploads/profiles/` and served as static files. The path is stored in the User document. To use cloud storage (S3/Cloudinary), swap out the Multer storage engine in `server/middleware/upload.js`.

---

## 🚀 Production Deployment

```bash
# Build the React frontend
npm run build:client

# Serve static files from Express (add to server/index.js):
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
```

Set `NODE_ENV=production` and use a process manager like PM2:
```bash
pm2 start server/index.js --name mednova
```

---

## 📦 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new patient |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile + photo |
| PUT | `/api/auth/change-password` | Change password |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List (role-filtered) |
| GET | `/api/appointments/slots` | Available time slots |
| POST | `/api/appointments` | Book appointment |
| POST | `/api/appointments/:id/pay` | Process payment |
| PUT | `/api/appointments/:id` | Update status |
| PATCH | `/api/appointments/:id/cancel` | Cancel |

### IPD / Beds
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ipd/beds` | All beds with status |
| POST | `/api/ipd/beds` | Create bed (admin) |
| GET | `/api/ipd` | All IPD records |
| POST | `/api/ipd` | Admit patient |
| PATCH | `/api/ipd/:id/discharge` | Discharge patient |
| POST | `/api/ipd/:id/vitals` | Add vitals entry |

*(Full list: auth, users, appointments, inventory, opd, ipd, prescriptions, doctors, dashboard)*

---

## 📝 License

MIT — Free for personal and commercial use.

Built with ❤️ for healthcare teams.
