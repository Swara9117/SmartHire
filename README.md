# SmartHire

**AI-Powered Job Portal** — built on the PrepIt interview-prep platform with full hiring workflows.

## Features

### Candidate
- User registration & login (OTP verified)
- Profile management & resume upload (PDF)
- Browse and apply for jobs
- AI-based job recommendations (Gemini)
- Resume analyzer, mock interviews, HR rounds, leaderboards (existing PrepIt features)

### Recruiter
- Post and manage job listings
- View and manage applicants per job
- Shortlist, reject, or hire candidates

### Admin
- Manage users and roles
- Dashboard analytics (users, jobs, applications)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, MongoDB, JWT |
| AI | Google Gemini API, FastAPI (interview services) |

## Installation

```bash
# Clone
git clone <your-repo-url>
cd PrepIt-1

# Backend
cd backend
npm install
# Create .env (see below)
node app.js

# Frontend
cd ../frontend
npm install
npm run dev

# FastAPI (optional - for mock interviews)
cd ../fastAPI_backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Environment Variables

### Backend (`backend/.env`)
```
PORT=4000
MONGO_URL=your_mongodb_connection
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
ADMIN_SETUP_SECRET=your_admin_setup_secret
```

### Create first Admin
```bash
curl -X POST http://localhost:4000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","emailid":"admin@example.com","password":"yourpassword","setupSecret":"your_admin_setup_secret"}'
```

## Run

| Service | Command | URL |
|---------|---------|-----|
| Backend | `node app.js` (in `backend/`) | http://localhost:4000 |
| Frontend | `npm run dev` (in `frontend/`) | http://localhost:5173 |
| FastAPI | `uvicorn main:app --reload` | http://localhost:8000 |

## Project Structure

```
PrepIt-1/
├── frontend/          # React app (SmartHire UI)
├── backend/           # Express API (jobs, applications, admin)
└── fastAPI_backend/   # AI interview services (unchanged)
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/jobs` | List open jobs |
| `POST /api/jobs` | Post job (Recruiter) |
| `POST /api/applications/apply` | Apply (Candidate) |
| `GET /api/recommendations/jobs` | AI job recommendations |
| `GET /api/admin/analytics` | Admin dashboard stats |

All existing PrepIt routes (`/auth`, `/api/resume`, `/api/gd`, interviews) remain unchanged.
