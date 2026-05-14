# فرصتي (Forsati) - منصة العمل اليومي والجزئي في الأردن

> A trusted platform for daily and part-time job opportunities in Jordan

---

## 🚀 Quick Start (Full Setup)

### Prerequisites
- Node.js 18+
- npm 9+

---

## 📁 Project Structure

```
forsati/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # App pages (auth, seeker, employer, admin)
│       ├── services/     # API service layer (axios)
│       └── hooks/        # useAuth context hook
│
└── backend/           # Node.js + Express + Prisma + SQLite
    ├── prisma/
    │   ├── schema.prisma   # Database models
    │   └── seed.js         # Sample Jordan data
    └── src/
        ├── routes/         # Express route files
        ├── controllers/    # Business logic
        ├── middleware/      # JWT auth middleware
        └── services/       # AI service (rule-based logic)
```

---

## ⚙️ Backend Setup

```bash
# 1. Go to backend folder
cd forsati/backend

# 2. Install dependencies
npm install

# 3. Set up environment (already created, or edit .env)
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="forsati_jwt_secret_2024_jordan_platform"
# PORT=5000
# FRONTEND_URL="http://localhost:5173"

# 4. Push database schema
npx prisma db push

# 5. Seed with Jordan sample data
node prisma/seed.js

# 6. Start the backend server
npm run dev
# Server runs at: http://localhost:5000
```

---

## 🎨 Frontend Setup

```bash
# 1. Go to frontend folder
cd forsati/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# App runs at: http://localhost:5173
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| باحث عمل | omar@student.jo | seeker123 |
| باحث عمل | nour@graduate.jo | seeker123 |
| صاحب عمل | events@jordanpro.jo | employer123 |
| صاحب عمل | delivery@zarqa.jo | employer123 |
| مدير | admin@forsati.jo | admin123 |

---

## 📱 App Pages

### Job Seeker
| Path | Page |
|------|------|
| `/` | Home - greeting, categories, recommended jobs, nearby jobs |
| `/jobs` | Browse all jobs with filters |
| `/jobs/:id` | Job details + apply button |
| `/applications` | My applications (all / pending / accepted / rejected) |
| `/notifications` | Notification center |
| `/profile` | Profile with skills, AI builder, trust score |

### Employer
| Path | Page |
|------|------|
| `/employer` | Dashboard - stats, quick actions, recent jobs |
| `/employer/create-job` | Post a new job (with live risk score preview) |
| `/employer/jobs` | Manage posted jobs |
| `/employer/applicants` | View and accept/reject applicants |

### Admin
| Path | Page |
|------|------|
| `/admin` | Stats, user management, reports |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register     # Create account
POST /api/auth/login        # Login
GET  /api/auth/me           # Get current user
```

### Jobs
```
GET    /api/jobs            # List jobs (with ?city=&category=&search=)
GET    /api/jobs/:id        # Job details
POST   /api/jobs            # Create job (EMPLOYER)
PUT    /api/jobs/:id        # Update job
DELETE /api/jobs/:id        # Close job
GET    /api/jobs/my         # Employer's own jobs
POST   /api/jobs/:id/apply  # Apply to job (JOB_SEEKER)
```

### Applications
```
GET /api/applications/my           # Seeker's applications
GET /api/applications/employer     # Employer's received applications
PUT /api/applications/:id/status   # Accept/Reject application
```

### AI Features
```
GET  /api/ai/recommended-jobs      # Smart job matching
POST /api/ai/profile-suggestions   # Profile builder from text
GET  /api/ai/trust-score/:userId   # Calculate trust score
```

### Admin
```
GET /api/admin/stats                # Platform stats
GET /api/admin/users                # All users
PUT /api/admin/users/:id/block      # Block/unblock user
PUT /api/admin/users/:id/verify     # Verify employer
PUT /api/admin/jobs/:id/block       # Block a job
GET /api/admin/reports              # View reports
PUT /api/admin/reports/:id/status   # Update report status
```

---

## 🤖 AI Features Explained

### 1. Smart Job Matching (`GET /api/ai/recommended-jobs`)
Rule-based scoring system matching seekers to jobs:
- **City match** (+25 pts) — same city as seeker
- **Remote work** (+30 pts) — always matches
- **Skills match** (+15 pts each) — checks job description for seeker's skills
- **Preferred job type** (+20 pts) — matches preferred categories
- **Verified employer** (+10 pts) — trusted employer bonus
- Returns top 10 matches with Arabic reason string

**Example reason:** `"هذه الفرصة مناسبة لك لأنها قريبة من موقعك وتناسب مهاراتك في تصميم جرافيك."`

### 2. Fake Job Detection (Risk Score 0–100)
Auto-calculates risk on every job post:
- Short description < 50 chars → +25
- No city specified → +15
- Payment > 100 JOD → +20
- Unverified employer → +15
- Suspicious words → +10 each
- Missing time fields → +10

If `riskScore > 60` → warning shown to seeker and job may be auto-blocked at 80+

### 3. Trust Score Calculator
For each user:
- Base: 50 points
- Verified account: +20
- Good rating (4.5+): +15
- Completed jobs (10+): +10
- Reports against user: −10 to −30
- Account age > 1 year: +5

### 4. AI Profile Builder (`POST /api/ai/profile-suggestions`)
Input: free Arabic/English text describing user's background
Output:
- Extracted skills list
- Suggested job categories
- Improved Arabic bio

---

## 🎯 Demo Flow

1. **Register as Employer** → `events@jordanpro.jo / employer123`
2. Go to Employer Dashboard → **نشر وظيفة** (Create Job)
3. Fill in job details and submit

4. **Register as Job Seeker** → `omar@student.jo / seeker123`
5. Home page shows **AI recommended jobs** based on skills
6. Browse jobs → click a job → **تقدم الآن** (Apply)
7. Check **طلباتي** (Applications) to see status

8. **Switch back to Employer** → Go to **المتقدمون** (Applicants)
9. Click **قبول** (Accept) on the application
10. Seeker gets a notification → check **الإشعارات**

11. **Login as Admin** → `admin@forsati.jo / admin123`
12. View stats, manage users, verify employers, resolve reports

---

## 🎨 Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#2563EB` |
| Success | `#16A34A` |
| Warning | `#F97316` |
| Background | `#F8FAFC` |
| Text Main | `#0F172A` |
| Text Secondary | `#64748B` |
| Border | `#E2E8F0` |
| Font | Tajawal (Google Fonts) |

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod-ready) |
| Auth | JWT + bcrypt |
| Language | Arabic RTL (Tajawal font) |

---

## 🔄 Production Notes

- Replace SQLite with PostgreSQL: change `provider = "sqlite"` to `postgresql` in schema.prisma
- Add real email service for forgot password
- Add file upload for avatars (Cloudinary / S3)
- Add real-time notifications via WebSockets
- Add Google OAuth for social login
