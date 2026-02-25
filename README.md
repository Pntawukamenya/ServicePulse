# ServicePulse

**A platform for public service communication and citizen reporting in Rwanda.** ServicePulse combines SMS alerts (for citizens without reliable internet) with web dashboards so government agencies and citizens stay connected.

---

## Table of Contents

- [Project overview](#project-overview)
- [Design & presentation](#design--presentation)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started (local development)](#getting-started-local-development)
- [Environment variables](#environment-variables)
- [Database schema](#database-schema)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Roles & access](#roles--access)
- [Security](#security)
- [For evaluators / supervisors](#for-evaluators--supervisors)
- [License](#license)

---

## Project overview

ServicePulse is a full-stack capstone project that enables:

- **Citizens** to submit and track service disruption reports (e.g. REG, WASAC, Emergency) and receive SMS alerts.
- **Agencies** (REG, WASAC, Emergency Services) to manage reports, send targeted SMS alerts, and view analytics.
- **Everyone** to use a responsive web app with light/dark theme and multi-language support (English, Kinyarwanda, French).

The codebase is a monorepo: **frontend** (React + Vite) and **backend** (Node.js + Express) in one repository, with clear separation for setup, deployment, and grading.

---

## Design & presentation

| Resource | Link |
|----------|------|
| **Figma UI design** | [Open in Figma](https://www.figma.com/design/WEQG4skoJu6RYiSC52fGiw/ServicePulse?node-id=0-1&t=VzV5uPCiElCJPwD2-1) |
| **Video presentation** | [Watch on Google Drive](https://drive.google.com/file/d/1kLV9zweZ76mL2QHhrhuKBdGxiLhVNbLL/view?usp=sharing) |

---

## Features

### Citizens

- Register and log in (email or phone).
- Submit reports with service type, location (sector/cell), description, and optional attachments (e.g. Cloudinary).
- View and track their own reports and status (e.g. Received → In Progress → Resolved).
- Manage profile and notification preferences.
- Receive SMS alerts for service disruptions (when Twilio is configured).

### Agencies (REG, WASAC, Emergency Services)

- Create and send targeted SMS alerts to citizens.
- View and filter reports assigned to their agency.
- Update report status (e.g. Under Review, In Progress, Resolved, Rejected).
- View report clusters/hotspots on a map.
- Access analytics: resolution rate, resolution time, priority distribution, monthly trends, reports by category.
- Approvals workflow for content (if enabled).

### Everyone

- **Light/dark theme** — toggle with persistence.
- **Multi-language** — English, Kinyarwanda (Kin), French (Fre) with persisted preference.
- **Responsive layout** — usable on desktop, tablet, and mobile.

---

## Technology stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Axios, React Hook Form |
| **Backend** | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, bcryptjs, express-validator |
| **Optional** | Twilio (SMS), Nodemailer (SMTP for password reset), Cloudinary (frontend uploads) |

---

## Project structure

```
ServicePulse/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database, SMS, email, USSD config
│   │   ├── controllers/    # Request handlers (auth, reports, notifications, analytics, etc.)
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/        # Mongoose models (User, Report, Agency, Notification, etc.)
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic
│   │   ├── utils/        # JWT, logger
│   │   ├── scripts/      # Seed, migrations
│   │   └── server.ts     # Entry point
│   ├── .env.example      # Example environment variables
│   └── package.json
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (citizen/, agency/, shared)
│   │   ├── lib/          # API client, Cloudinary
│   │   ├── store/        # Zustand (auth, theme, language)
│   │   ├── i18n/         # Translations (en, rw, fr)
│   │   ├── config/       # Services, app config
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB** — local (`mongodb://localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Optional:** [Twilio](https://www.twilio.com) account for SMS; [Cloudinary](https://cloudinary.com) for image uploads; SMTP for password-reset emails

---

## Getting started (local development)

### 1. Clone and open the repo

```bash
git clone <repository-url>
cd ServicePulse
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (see [Environment variables](#environment-variables)). Minimum for local run:

- `MONGODB_URI` — e.g. `mongodb://localhost:27017/servicepulse` or your Atlas URI  
- `JWT_SECRET` — any long random string  
- `FRONTEND_URL` — `http://localhost:3000`

Seed the database (creates REG, WASAC, Emergency agencies):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at **http://localhost:5000**. Health check: http://localhost:5000/health

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

- `VITE_API_URL=http://localhost:5000/api`
- Optional: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` for profile/upload features

Start the frontend:

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**. Use the app to register (citizen or agency), log in, and test reports and alerts.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. `mongodb://localhost:27017/servicepulse` or Atlas `mongodb+srv://...`) |
| `JWT_SECRET` | Yes | Secret for signing JWTs (use a long random string) |
| `FRONTEND_URL` | Yes (for CORS) | Frontend origin (e.g. `http://localhost:3000` or `https://your-app.vercel.app`) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `PORT` | No | Server port (default: `5000`; Render sets this automatically) |
| `TWILIO_ACCOUNT_SID` | No | Twilio SID (SMS) |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | Twilio phone number |
| `SMTP_*` | No | SMTP settings for password-reset emails |

See `backend/.env.example` for a full template.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | No | Cloudinary unsigned upload preset |

---

## Database schema

MongoDB collections used by the backend:

| Collection | Purpose |
|------------|---------|
| `users` | User accounts; roles: citizen, agency_employee, agency_admin, admin; linked to agency via `agency_id` for agency users |
| `agencies` | Service agencies (REG, WASAC, Emergency); created by `npm run seed` |
| `reports` | Citizen-submitted reports (service type, location, status, priority, timestamps) |
| `notifications` | SMS alerts created and sent by agencies |
| `otpverifications` | OTP codes for registration and password reset |
| Others | Supporting models (e.g. status history, approvals) as needed |

---

## API reference

Base path: `/api`. All protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (citizen or agency user) |
| POST | `/api/auth/login` | Login; returns JWT |
| POST | `/api/auth/forgot-password` | Request password reset (OTP via email/SMS) |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| PUT | `/api/auth/change-password` | Change password (protected) |
| GET | `/api/auth/profile` | Get current user profile (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Create report (citizen) |
| GET | `/api/reports/my-reports` | List current user's reports (citizen) |
| GET | `/api/reports/agency` | List agency reports (agency) |
| GET | `/api/reports/:id` | Get single report (citizen: own; agency: agency) |
| PUT | `/api/reports/:id/status` | Update report status (agency) |
| DELETE | `/api/reports/:id` | Delete report (citizen: own; agency: agency) |
| GET | `/api/reports/agency/clusters` | Location clusters for map (agency) |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Create and send SMS alert (agency) |
| GET | `/api/notifications/agency` | List agency notifications (agency) |

### Analytics & stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/reports` | Report analytics (resolution rate, trends, by category, priority) (agency) |
| GET | `/api/stats/*` | Stats endpoints as implemented (agency/admin) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (no auth); returns `{ status: 'ok', timestamp }` |

---

## Deployment

### Backend (Render)

1. **MongoDB** — Create a cluster (e.g. MongoDB Atlas), copy the connection string, and allow access from Render (e.g. allow `0.0.0.0/0` in Atlas network access).

2. **Render** — Log in at [render.com](https://render.com) → **New** → **Web Service** → Connect the ServicePulse repo.

3. **Service settings**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Runtime:** Node

4. **Environment variables** (Render → Environment)
   - `MONGODB_URI` — your MongoDB connection string  
   - `JWT_SECRET` — long random string (e.g. 32+ characters)  
   - `FRONTEND_URL` — your frontend URL (e.g. `https://your-app.vercel.app`, no trailing slash)

5. **Deploy** — Create the service. Render sets `PORT` automatically. After deploy, open `https://<your-service>.onrender.com/health` to verify.

6. **Seed (optional)** — Run `npm run seed` once (e.g. via Render Shell or locally with the same `MONGODB_URI`) to create agencies.

### Frontend (Vercel)

1. Import the repo into [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment variable:** `VITE_API_URL` = backend API base (e.g. `https://<your-backend>.onrender.com/api`)
6. Deploy. Then set the backend’s `FRONTEND_URL` to the Vercel URL so CORS allows the frontend.

---

## Roles & access

| Role | Capabilities |
|------|--------------|
| **Citizen** | Register, log in, submit reports, view own reports, manage profile, receive alerts |
| **Agency** | Everything citizens have for their own data; plus view agency reports, update status, create alerts, analytics. Requires `agency_id` in user record. |
| **Admin** | Full access (admin-specific features as implemented) |

Agency users must be associated with an agency (REG, WASAC, or Emergency) via `agency_id` in the database; agencies are created by the seed script.

---

## Security

- **Authentication:** JWT-based; tokens in `Authorization` header; expiry configurable via `JWT_EXPIRES_IN`.
- **Passwords:** Hashed with bcrypt.
- **Input validation:** express-validator on backend; React Hook Form on frontend.
- **CORS:** Backend allows only `FRONTEND_URL` in production.
- **Role-based routes:** Middleware restricts endpoints by user role.

---

## For evaluators / supervisors

This section summarizes what is implemented for grading and demo.

- **Full-stack application:** React frontend (Vite) + Node/Express backend (TypeScript), MongoDB, JWT auth.
- **User flows:** Registration (citizen/agency), login, profile, password reset (OTP), report creation and tracking, agency report management and status updates.
- **Features:** Reports (CRUD, status workflow), notifications (SMS alerts via Twilio when configured), analytics dashboard (resolution rate, trends, by category/priority), approvals (if enabled), map/clusters.
- **UX:** Responsive layout, light/dark theme, i18n (EN, Kinyarwanda, French), Cloudinary uploads for report attachments.
- **Code quality:** TypeScript on frontend and backend, structured routes/controllers/services, validation and error handling, environment-based config.
- **Deployment:** Backend deployable to Render (with Root Directory `backend` and env vars); frontend deployable to Vercel (Root Directory `frontend`, `VITE_API_URL` pointing to backend). README documents both.
- **Design & presentation:** Figma link and video presentation linked at the top of this README.

To run locally: follow [Prerequisites](#prerequisites) and [Getting started (local development)](#getting-started-local-development). To test deployment: use the same env vars as in the README for Render and Vercel.

---

## License

Capstone project — academic use.

---

**ServicePulse** — Bridging the digital divide, one alert at a time.
