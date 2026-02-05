# ServicePulse

A centralized, multi-channel public service communication and citizen reporting platform for Rwanda. ServicePulse addresses digital access inequality by combining SMS-based notifications (for non-internet users) with web-based dashboards for government agencies and citizens.

## Project Overview

ServicePulse is designed as a final-year BSc Software Engineering capstone project, implementing a high-quality functional prototype suitable for:
- Initial software product demonstration
- Full-Stack specialization grading
- Defense presentation
- Future scalability across East Africa

## Features

### For Citizens
- **SMS Alerts**: Receive location-based service disruption notifications via SMS
- **Service Reporting**: Submit and track service disruption reports
- **Profile Management**: Manage notification preferences and location settings
- **Opt-in/Opt-out**: Control SMS alert subscriptions

### For Agencies (REG, WASAC, Emergency Services)
- **Alert Creation**: Create and send targeted SMS notifications
- **Reports Inbox**: View and manage citizen-submitted reports
- **Status Tracking**: Update report status (Received → In Progress → Resolved)
- **Location Clustering**: Identify service hotspots through aggregated data
- **Dashboard Analytics**: Overview metrics for alerts and reports

### Public Features
- Clean, government-grade UI/UX
- Light/Dark theme support
- Multi-language ready (EN/Kinyarwanda placeholder)
- Responsive design for all devices

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

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Twilio account (optional, for SMS - pilot mode works without it)

### Backend Setup

1. Navigate to the backend directory:
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

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
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
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

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

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend (Netlify/Vercel)
1. Connect your GitHub repository
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL` (your backend URL)

## SMS Integration

ServicePulse supports SMS notifications via Twilio. In pilot mode (without Twilio credentials), SMS sending is logged to the console instead of being sent.

To enable full SMS functionality:
1. Create a Twilio account
2. Get your Account SID, Auth Token, and Phone Number
3. Add them to your backend `.env` file

## Role-Based Access Control

- **Citizen**: Can submit reports, view own reports, manage profile
- **Agency**: Can create alerts, view reports, update report status
  - Note: Agency users must have their `agency_id` set in the database to match their agency (REG, WASAC, or Emergency Services)
- **Admin**: Full access (limited implementation in this phase)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Role-based route protection
- Secure session handling

## Troubleshooting

### "Could not find the 'agency_code' column" error
Your database is missing the v2 schema. Run `backend/supabase-schema-v2.sql` in the Supabase SQL Editor (Dashboard → SQL Editor). This adds `agency_code`, `identifier_type`, `status`, the `otp_verifications` table, and related columns.

### Backend errors
API errors are logged to the backend terminal with the route and error message for easier debugging.

## Development Notes

- The application uses TypeScript for type safety
- All API responses follow consistent error handling patterns
- Frontend uses React Hook Form for form validation
- Zustand provides lightweight state management
- Tailwind CSS ensures consistent, responsive styling

## Future Enhancements

- Advanced analytics and reporting
- Automated response systems
- Multi-language support (Kinyarwanda)
- Mobile app development
- National-scale deployment
- Integration with additional service providers

## License

This project is developed as a capstone project for academic purposes.

## Contact

For questions or support, please contact through the platform or your local service agency.

---

**ServicePulse** - Bridging the digital divide, one alert at a time.
