# ServicePulse

A platform for public service communication and citizen reporting in Rwanda. We combine SMS alerts (for citizens without reliable internet) with web dashboards so agencies and citizens stay connected.

If you're reading this, you're probably setting it up, contributing, or grading it. Here’s what you need to know.

### Figma UI Design: [Click Here](https://www.figma.com/design/WEQG4skoJu6RYiSC52fGiw/ServicePulse?node-id=0-1&t=VzV5uPCiElCJPwD2-1)
### Video Presentation:



## What You Get

### Citizens
- SMS alerts for service disruptions in their area
- Submit and track reports (REG, WASAC, Emergency)
- Manage profile and notification preferences

### Agencies (REG, WASAC, Emergency Services)
- Create and send targeted SMS alerts
- View and manage citizen reports
- Update status (Received → In Progress → Resolved)
- See service hotspots and basic analytics

### Everyone
- Light/dark theme, multi-language (EN, Kinyarwanda, French), responsive layout

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API communication
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Supabase** (PostgreSQL) for database
- **JWT** for authentication
- **Twilio** for SMS integration (pilot mode)
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Project Structure

```
ServicePulse/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, SMS configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # JWT utilities
│   │   └── server.ts        # Express server entry point
│   ├── supabase-schema.sql  # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── citizen/    # Citizen dashboard pages
│   │   │   └── agency/     # Agency dashboard pages
│   │   ├── lib/            # API client
│   │   ├── store/          # Zustand stores
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## Getting Started

You'll need Node.js 18+, a Supabase project, and optionally Twilio for SMS (pilot mode works without it).

### Backend

1. Go to the backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# SMS Provider (Twilio) - Optional for pilot mode
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run `backend/supabase-schema.sql` first
   - Then run `backend/supabase-schema-v2.sql` (adds OTP, agency_code, status, etc.)
   - Run `backend/supabase-migrations/001_add_avatar_url.sql` (adds `avatar_url` column for Cloudinary profile pictures)

5. Start the development server:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Frontend

1. Go to the frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api

# Cloudinary (profile picture uploads) - get from cloudinary.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```
Create an unsigned upload preset in Cloudinary: Settings → Upload → Add upload preset → set "Signing Mode" to "Unsigned".

4. Start the development server:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Database Schema

The database includes the following tables:
- **users**: User accounts with role-based access
- **agencies**: Government service agencies (REG, WASAC, Emergency)
- **services**: Service types per agency
- **reports**: Citizen-submitted service disruption reports
- **notifications**: SMS alerts sent by agencies

See `backend/supabase-schema.sql` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Reports
- `POST /api/reports` - Create new report (citizen)
- `GET /api/reports/my-reports` - Get user's reports (citizen)
- `GET /api/reports/agency` - Get agency reports (agency)
- `PUT /api/reports/:id/status` - Update report status (agency)
- `GET /api/reports/agency/clusters` - Get location clusters (agency)

### Notifications
- `POST /api/notifications` - Create and send alert (agency)
- `GET /api/notifications/agency` - Get agency notifications (agency)

## Deploying

### Backend (Render)

Connect your repo to Render, create a Web Service, and set:
- Build: `npm install && npm run build`
- Start: `npm start`
- Copy env vars from `.env.example`

### Frontend (Vercel)

1. Import this repo into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env var `VITE_API_URL` = your backend URL (e.g. `https://your-app.onrender.com/api`)

Vercel will auto-detect the Vite app and run the build. Once deployed, point your backend `FRONTEND_URL` to the Vercel URL.

## SMS (Twilio)

We use Twilio for SMS. Without credentials, it logs to the console instead of sending. To turn it on: create a Twilio account, grab SID, Auth Token, and phone number, then add them to your backend `.env`.

## Roles

- **Citizen** — Submit reports, view own reports, manage profile
- **Agency** — Create alerts, view reports, update status. Agency users need `agency_id` set in the DB to match their agency (REG, WASAC, or Emergency)
- **Admin** — Full access (limited in this phase)

## Security

JWT auth, bcrypt passwords, express-validator for inputs, CORS, role-based routes, secure sessions.

## If Something Breaks

**"Could not find the 'agency_code' column"** — Run `backend/supabase-schema-v2.sql` in Supabase (SQL Editor). That adds the v2 schema.

**Backend errors** — Check the backend terminal; we log the route and message there.

## Notes for Contributors

- TypeScript throughout
- React Hook Form + Zustand on the frontend
- Tailwind for styling
- API errors follow a consistent format

## Roadmap

More analytics, automated responses, full Kinyarwanda support, mobile app, and national-scale deployment when we're ready.

## License

Capstone project — academic use.

---

**ServicePulse** — Bridging the digital divide, one alert at a time.
