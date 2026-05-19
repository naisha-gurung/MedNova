# MedNova — Hospital Management System

A full-stack, production-grade Hospital Management System built with React.js, Node.js, Express, and MongoDB.

---

## 🏥 Features at a Glance

| Module | Description |
|---|---|
| **Auth** | JWT + Google OAuth, Role-based access (7 roles) |
| **Dashboard** | Role-aware dashboards — patients see personal health data, doctors see their schedule, admins see full hospital stats |
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
| **Admin** | ✅ Full + Revenue | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Doctor** | ✅ Own schedule | ✅ Write | ✅ Write | ✅ Write | ✅ Write | 👁 Read | ❌ |
| **Nurse** | ✅ Hospital ops | ✅ Write | ✅ Write | ✅ Write | ✅ Write | 👁 Read | ❌ |
| **Pharmacist** | ✅ Hospital ops | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ✅ Write | ❌ |
| **Receptionist** | ✅ Hospital ops | ✅ Book | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ❌ |
| **Patient** | ✅ Personal only | ✅ Own only | ❌ | ❌ | 👁 Own only | ❌ | ❌ |
| **Worker** | ✅ Hospital ops | 👁 Read | 👁 Read | 👁 Read | 👁 Read | 👁 Read | ❌ |

### Dashboard breakdown by role

- **Admin** — full hospital stats (patients, doctors, beds, OPD/IPD, low stock, revenue), appointment trend chart, recent appointments from all users
- **Doctor** — own today's appointments, pending approvals, unique patients seen, prescriptions issued, quick links to schedule/OPD/prescriptions
- **Nurse / Receptionist / Pharmacist / Worker** — hospital-operational stats (patients, doctors, beds, OPD/IPD, low stock) — **no revenue data**
- **Patient** — personal stats only (own appointments, upcoming visits, prescriptions), quick action cards, own appointment history. No hospital-level data is exposed.

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
│   │   └── dashboard.js      # Role-aware stats endpoint
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
│   │   │   ├── DashboardPage.jsx # Renders PatientDashboard / DoctorDashboard / AdminDashboard
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

This creates sample users, 12 medicines, 30 beds, 41 appointments spread across the past 6 months and future, 20 OPD records, 20 prescriptions, and 4 IPD records (2 active, 2 discharged).

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
| Doctor (Neurology) | doctor3@mednova.com |
| Doctor (Pediatrics) | doctor4@mednova.com |
| Doctor (Dermatology) | doctor5@mednova.com |
| Nurse | nurse@mednova.com |
| Pharmacist | pharmacist@mednova.com |
| Receptionist | receptionist@mednova.com |
| Worker | worker@mednova.com |
| Patient | patient@mednova.com |
| Patient 2 | patient2@mednova.com |

---

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add `http://localhost:3000` to Authorized JavaScript origins
5. Copy Client ID to both `.env` files

---

## 🏗 Key Design Decisions

### Role-Aware Dashboards
The `/api/dashboard/stats` endpoint detects the requesting user's role and returns only the data relevant to them. Patients receive their own appointment and prescription counts — no hospital-level metrics. Doctors receive their personal schedule stats. Admins are the only role that receives revenue figures. This is enforced server-side; the frontend simply renders whichever dashboard component matches the `role` field in the API response.

### Appointment Trend Chart
The dashboard chart aggregates appointments by their scheduled `date` field (not `createdAt`), grouped by day over the last 30 days. This ensures the graph reflects actual appointment activity across the calendar rather than database insertion time.

### No Double Booking
Appointments enforce uniqueness at the database level via a compound index on `(doctor, date, timeSlot)`. The API also checks in-memory before attempting insertion.

### IPD Status Flow
IPD patients move through two active statuses: **Under Treatment** (default on admission) → **Discharged** (via the Discharge button). The old "admitted" status and the auto-derive logic that previously overrode status on every fetch have been removed. Status is now stable and only changes via explicit user action.

### Bed Allocation
Before admitting a patient, the backend verifies the selected bed is unoccupied (`bed` field in the request body). Upon discharge, the bed is automatically freed in the same transaction.

### Payment System
A placeholder payment flow is implemented: booking creates a `pending` appointment → "Pay & Book" triggers `/appointments/:id/pay` which sets `paymentStatus: 'paid'` and `status: 'confirmed'`. Replace this endpoint with Razorpay/Stripe when ready.

### Prescription Medicines
- **From Inventory**: Linked to actual stock (dropdown from inventory collection)
- **Other Medicine** (visually distinct with amber tag): `isExternal: true`, free-text name, not deducted from stock

Empty strings are stripped from all ObjectId fields (`appointment`, `patient`, `inventoryItem`) before hitting Mongoose to prevent `CastError` on optional fields.

### Profile Picture Upload
Files are stored in `server/uploads/profiles/` and served as static files. The path is stored in the User document. The file filter accepts any `image/*` MIME type. To use cloud storage (S3/Cloudinary), swap out the Multer storage engine in `server/middleware/upload.js`.

### Error Handling & Toast Deduplication
The Axios interceptor in `api.js` marks handled errors with `_toasted = true` before rejecting. Component-level catch blocks check this flag to avoid showing a second duplicate toast for the same error. 403 responses show "Not authorized" once and stop — patients navigating to restricted pages (e.g. IPD) won't see a confusing generic error.

---

## 🐛 Bug Fixes Changelog

### Dashboard Appointment Chart — "No data" / single dot
- **Root cause**: The monthly trend aggregates were matching on `createdAt` instead of the appointment's `date` field. Additionally, when all test data was in the same month, a line chart would only render a single dot.
- **Fix**: All three aggregates (patient, doctor, admin) now match and group by `date`. The frontend groups by day over 30 days instead of month over 6 months, so even same-month data renders as a proper line.

### IPD — Admitted Patients Immediately Showed as "Under Treatment"
- **Root cause**: A `deriveIPDStatus()` function ran on every `GET /ipd` request and auto-updated any record where `diffMs >= 0` (which is always true) to `under-treatment`, overwriting the freshly saved `admitted` status in the same response.
- **Fix**: Removed `deriveIPDStatus` entirely from both backend and frontend. The `admitted` status enum value was also removed. All new admissions default to `under-treatment` directly, and status only changes via explicit discharge action.

### IPD Admission — "Bed not found" on Every Admit
- **Root cause**: The controller destructured `const { bedId } = req.body` but the form submits the field as `bed`, so `bedId` was always `undefined` and `Bed.findById(undefined)` always returned null.
- **Fix**: Changed to `const bedId = req.body.bed` to read the correct field name.

### Prescriptions — `CastError` on `inventoryItem` / `appointment` Fields
- **Root cause**: Optional ObjectId fields were being sent as empty strings `""` when not selected, which Mongoose cannot cast to ObjectId.
- **Fix**: A `sanitizePayload()` helper strips any empty-string, `null`, or `undefined` ObjectId fields before the API call on the frontend. The backend controller does the same as a safety net. This pattern applies to `appointment`, `patient`, and `inventoryItem`.

### Profile Picture Upload — "Only image files are allowed" on Valid Images
- **Root cause**: The Multer `fileFilter` used a regex `/jpeg|jpg|png|gif|webp/` on `file.originalname` which could fail on files without extensions or with uncommon but valid MIME types like `image/heic`.
- **Fix**: Changed the check to `file.mimetype.startsWith('image/')` which correctly accepts all image types browsers can send.

### Double Toast Errors
- **Root cause**: The Axios response interceptor fired `toast.error('Server error...')` on every 500, then rejected the promise, landing in the component's catch which fired a second toast ("Failed to load...").
- **Fix**: Interceptor sets `error._toasted = true` before rejecting. All component catch blocks now check `if (!err._toasted)` before showing their own toast.

### Auth Route — `authController is not defined`
- **Root cause**: `routes/auth.js` destructured individual functions at the top (`const { register, login, ... } = require(...)`) but then called them as `authController.register` — `authController` was never defined.
- **Fix**: Changed all route handlers to use the already-destructured function names directly (e.g. `register` instead of `authController.register`). Also added the missing `router.post('/login', login)` route that was not registered.

### Prescription Model — `SyntaxError: Unexpected token '<'`
- **Root cause**: React JSX code from `PrescriptionModal` was accidentally pasted into `server/models/Prescription.js`, causing Node.js to crash immediately on startup.
- **Fix**: Restored `Prescription.js` to the pure Mongoose schema with no frontend code.

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
| GET | `/api/appointments` | List (role-filtered — patients see own, doctors see own, admins see all) |
| GET | `/api/appointments/slots` | Available time slots |
| POST | `/api/appointments` | Book appointment |
| POST | `/api/appointments/:id/pay` | Process payment |
| PUT | `/api/appointments/:id` | Update status |
| PATCH | `/api/appointments/:id/cancel` | Cancel |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Role-aware stats — response shape varies by role (patient / doctor / admin+staff) |

### IPD / Beds
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ipd/beds` | All beds with occupancy status |
| POST | `/api/ipd/beds` | Create bed (admin only) |
| PUT | `/api/ipd/beds/:id` | Update bed (admin, nurse) |
| GET | `/api/ipd` | All IPD records (filterable by status) |
| POST | `/api/ipd` | Admit patient |
| PUT | `/api/ipd/:id` | Update IPD record |
| PATCH | `/api/ipd/:id/discharge` | Discharge patient + free bed |
| POST | `/api/ipd/:id/vitals` | Add vitals entry |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/prescriptions` | List (role-filtered) |
| GET | `/api/prescriptions/:id` | Get single prescription |
| POST | `/api/prescriptions` | Create prescription |
| PUT | `/api/prescriptions/:id` | Update prescription |

### OPD
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/opd` | List OPD records |
| POST | `/api/opd` | Create OPD visit |
| PUT | `/api/opd/:id` | Update OPD record |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory` | List all items |
| POST | `/api/inventory` | Add item |
| PUT | `/api/inventory/:id` | Update item |
| DELETE | `/api/inventory/:id` | Delete item |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List users (admin+) |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| PATCH | `/api/users/:id/toggle-status` | Activate/deactivate user |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | Search doctors (name, specialization) |
| GET | `/api/doctors/specializations` | List all specializations |
| GET | `/api/doctors/:id` | Get single doctor |

---