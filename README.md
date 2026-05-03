# HA Salon Exclusive — Gym Management System

A production-ready gym management web application built with:

- **Backend**: .NET 9 Web API (Clean Architecture)
- **Frontend**: React + Vite + JavaScript
- **Database**: MongoDB
- **Auth**: JWT + Refresh Token (per-user sessions)
- **Styling**: Tailwind CSS v4

---

## Project Structure

```
Gym-system/
├── backend/
│   ├── GymManagement.Domain          # Entities, Enums
│   ├── GymManagement.Application     # DTOs, Interfaces
│   ├── GymManagement.Infrastructure  # Services, MongoDB, JWT
│   └── GymManagement.API             # Controllers, Middleware
├── frontend/
│   └── src/
│       ├── components/               # UI components (Button, Card, Modal, Table...)
│       ├── layouts/                  # PublicLayout, AdminLayout, MemberLayout
│       ├── pages/
│       │   ├── public/               # Home, Login, Register, Pending
│       │   ├── member/               # Dashboard, Profile, Progress, Membership...
│       │   └── admin/                # Dashboard, Members, Approvals, Packages...
│       ├── routes/                   # Protected route guards
│       ├── services/                 # Axios API service layer
│       ├── store/                    # Zustand auth store
│       └── utils/                    # Constants, formatters
└── GymManagement.sln
```

---

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or a MongoDB Atlas connection string

---

## Backend Setup

### 1. Navigate to the API project

```powershell
cd backend/GymManagement.API
```

### 2. Configure settings

Edit `appsettings.Development.json` (or set environment variables):

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "GymManagement_Dev"
  },
  "Jwt": {
    "SecretKey": "your_secret_key_minimum_32_chars_long_here",
    "Issuer": "GymManagement",
    "Audience": "GymManagementApp",
    "AccessTokenExpiryMinutes": 30,
    "RefreshTokenExpiryDays": 7
  },
  "AdminSeed": {
    "Email": "admin@gym.com",
    "Password": "Admin@123",
    "FirstName": "Gym",
    "LastName": "Admin"
  },
  "AllowedOrigins": "http://localhost:5173"
}
```

> **Important:** Change `SecretKey` to a random string of at least 32 characters in production.

### 3. Run the backend

```powershell
dotnet run --project backend/GymManagement.API
```

The API will be available at `http://localhost:5000`.

On first startup, a default admin user is automatically seeded using the `AdminSeed` config.

---

## Frontend Setup

### 1. Navigate to the frontend folder

```powershell
cd frontend
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure environment (optional)

If the backend runs on a different port, copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

> By default, Vite proxies `/api` requests to `http://localhost:5000` automatically.
> You only need the `.env` file if you want to override the URL.

### 4. Start the frontend

```powershell
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Default Admin Credentials

```
Email:    admin@gym.com
Password: Admin@123
```

Change these immediately in `appsettings.json` for any real deployment.

---

## Key Features

### Public Website
- Hero landing page with gym intro
- Feature cards, stats, and contact section
- WhatsApp contact button
- Map placeholder section
- Register and Login buttons

### Member Panel
- Registration with multi-step form (account info → physical details → fitness goals)
- Pending approval state — dashboard blocked until admin approves
- Member dashboard with membership status and quick stats
- Profile management
- Membership details and progress bar
- Progress tracking with weight chart (recharts)
- Session schedule viewer
- Calorie calculator (Mifflin-St Jeor equation with macros)

### Admin Panel
- Dashboard with KPI cards (members, income, expenses, overdue payments)
- Member list with search, filter by status, pagination
- Member detail drawer with package assignment
- Pending approval flow (approve / reject)
- Membership package CRUD (create, edit, delete)
- Payment management (create records, update status)
- Product management for gym shop items
- Expense management with categories
- Session scheduling management
- Reports page (structure ready, Excel export prepared for future)
- WhatsApp settings page (settings + template + log infrastructure — no real sending yet)

---

## Authentication Flow

- Member registers → status = **Pending**
- Admin approves → status = **Approved** → member gains dashboard access
- JWT access token (short-lived, default 30 min)
- Refresh token (longer-lived, default 7 days) stored in DB per session
- Multiple users can be logged in simultaneously — each session is independent
- Logout revokes only the specific session's refresh token (not global logout)
- Frontend auto-refreshes access token via Axios interceptor

---

## API Endpoints Summary

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register-member | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/refresh | Public |
| POST | /api/auth/logout | Authenticated |
| GET | /api/auth/me | Authenticated |
| GET | /api/admin/dashboard | Admin |
| GET | /api/admin/members | Admin |
| GET | /api/admin/members/pending | Admin |
| PUT | /api/admin/members/{id}/approve | Admin |
| PUT | /api/admin/members/{id}/reject | Admin |
| POST | /api/admin/members/{id}/assign-package | Admin |
| GET/POST/PUT/DELETE | /api/packages | Admin (write) |
| GET/POST/PUT | /api/payments | Admin |
| GET/POST/PUT/DELETE | /api/products | Admin (write) |
| GET/POST/PUT/DELETE | /api/expenses | Admin |
| GET/POST/PUT/DELETE | /api/sessions | Admin |
| GET | /api/progress/me | Member |
| POST | /api/progress | Member |
| GET | /api/progress/member/{id} | Admin |
| GET/PUT | /api/whatsapp/settings | Admin |
| GET/POST/PUT/DELETE | /api/whatsapp/templates | Admin |
| GET | /api/whatsapp/logs | Admin |
| GET/PUT | /api/member/profile | Member |
| GET/POST | /api/member/progress | Member |
| GET | /api/member/sessions | Member |

---

## Environment Variables

### Backend (`appsettings.json` or environment variables)

| Key | Description |
|-----|-------------|
| `MongoDB:ConnectionString` | MongoDB connection string |
| `MongoDB:DatabaseName` | Database name |
| `Jwt:SecretKey` | JWT signing key (min 32 chars) |
| `Jwt:Issuer` | Token issuer |
| `Jwt:Audience` | Token audience |
| `Jwt:AccessTokenExpiryMinutes` | Access token lifetime |
| `Jwt:RefreshTokenExpiryDays` | Refresh token lifetime |
| `AdminSeed:Email` | Default admin email |
| `AdminSeed:Password` | Default admin password |
| `AllowedOrigins` | Frontend URL for CORS |

### Frontend (`.env`)

| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Production Deployment Notes

1. Set a strong `Jwt:SecretKey` (32+ random chars)
2. Change default admin password immediately after first login
3. Set `AllowedOrigins` to your production frontend domain
4. Use Render PostgreSQL (or another managed PostgreSQL instance)
5. Set `ASPNETCORE_ENVIRONMENT=Production`
6. Build frontend: `npm run build` and serve `dist/` via a web server or CDN

---

## Render Deployment (Demo Link)

Project includes a ready `render.yaml` blueprint for one PostgreSQL database, one .NET API web service, and one static frontend service.

### 1. Push project to GitHub

Render deploys from a Git repository, so first push this project to GitHub.

### 2. Create services with Blueprint

In Render dashboard:

1. **New +** -> **Blueprint**
2. Select the repository
3. Render reads `render.yaml` and creates:
   - `gym-postgres`
   - `gym-api`
   - `gym-frontend`

### 3. Finalize required environment values

After first deploy, set these values in Render:

- `gym-api` -> `AllowedOrigins` = your frontend URL (for example `https://gym-frontend.onrender.com`)
- `gym-frontend` -> `VITE_API_URL` = your backend URL + `/api` (for example `https://gym-api.onrender.com/api`)

Then redeploy `gym-frontend` once so Vite rebuilds with the correct API URL.

### 4. First login

`AdminSeed__Password` is generated automatically in Render. Copy it from `gym-api` environment variables and login with:

- Email: `admin@gym.demo`
- Password: generated `AdminSeed__Password`

Change password immediately after login.

---

## WhatsApp Integration (Future)

The WhatsApp infrastructure is fully prepared:
- `WhatsAppSettings` entity in DB
- `MessageTemplate` CRUD
- `MessageLog` collection
- `IWhatsAppService` interface with `SendMessageAsync`
- Admin settings UI ready

To activate: implement `SendMessageAsync` in `WhatsAppService.cs` using your preferred provider (Meta Cloud API, Twilio, etc.) and set `IsEnabled = true` via the admin panel.




cd "C:\Users\sfkoc\Desktop\Gym-system\backend\GymManagement.API"; dotnet run --urls "http://localhost:5000"

# 5000 portundaki process'i öldür
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force

# Sonra yeniden başlat
cd "C:\Users\sfkoc\Desktop\Gym-system\backend\GymManagement.API"
dotnet run --urls "http://localhost:5000"