# Kiddie Bus - Deployment Instructions

## Project Overview

Kiddie Bus is a school transportation management application with:
- **Backend**: Python/Flask REST API with PostgreSQL
- **Frontend**: React SPA with Vite
- **Deployment**: Heroku with GitHub Actions CI/CD

---

## Prerequisites

- Git installed
- GitHub account
- Heroku CLI installed (`brew install heroku/brew/heroku`)
- Heroku account
- Node.js >= 18.x
- Python 3.11+
- PostgreSQL (for local development)

---

## Local Development Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create local PostgreSQL database
createdb kiddiebus

# Copy environment file and configure
cp .env.example .env
# Edit .env with your local settings

# Initialize database migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run the development server
python run.py
```

Backend will be available at: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit with: VITE_API_URL=http://localhost:5000/api

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Heroku Deployment

### Step 1: Initialize Git Repository

```bash
cd /path/to/kiddiebus

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Kiddie Bus application"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `kiddiebus`
3. Do NOT initialize with README (we already have code)
4. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kiddiebus.git
git branch -M main
git push -u origin main
```

### Step 3: Create Heroku Applications

```bash
# Login to Heroku
heroku login

# Create backend app
heroku create kiddiebus-api

# Create frontend app
heroku create kiddiebus-app

# Add PostgreSQL to backend
heroku addons:create heroku-postgresql:essential-0 --app kiddiebus-api
```

Note your app URLs:
- Backend: `https://kiddiebus-api-XXXXX.herokuapp.com`
- Frontend: `https://kiddiebus-app-XXXXX.herokuapp.com`

### Step 4: Configure Backend Environment Variables

```bash
# Generate secure random keys
# You can use: python -c "import secrets; print(secrets.token_hex(32))"

heroku config:set SECRET_KEY=your-secure-random-key-here --app kiddiebus-api
heroku config:set JWT_SECRET_KEY=your-jwt-secret-key-here --app kiddiebus-api
heroku config:set FLASK_ENV=production --app kiddiebus-api
```

The `DATABASE_URL` is automatically set by Heroku PostgreSQL addon.

### Step 5: Configure GitHub Secrets for CI/CD

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Value |
|------------|-------|
| `HEROKU_API_KEY` | Your Heroku API key (find at: https://dashboard.heroku.com/account) |
| `HEROKU_EMAIL` | Your Heroku account email |
| `HEROKU_BACKEND_APP_NAME` | `kiddiebus-api` (or your backend app name) |
| `HEROKU_FRONTEND_APP_NAME` | `kiddiebus-app` (or your frontend app name) |
| `VITE_API_URL` | `https://kiddiebus-api-XXXXX.herokuapp.com/api` |

### Step 6: Deploy via GitHub Actions

Push to main branch to trigger automatic deployment:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Run backend tests
2. Run frontend build test
3. Deploy backend to Heroku
4. Deploy frontend to Heroku

### Step 7: Initialize Production Database

After first deployment, run migrations:

```bash
heroku run flask db upgrade --app kiddiebus-api
```

---

## Manual Heroku Deployment (Alternative)

If you prefer manual deployment without GitHub Actions:

### Deploy Backend

```bash
cd backend

# Login to Heroku container registry
heroku container:login

# Set git remote
heroku git:remote -a kiddiebus-api

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run flask db upgrade --app kiddiebus-api
```

### Deploy Frontend

```bash
cd frontend

# Build the app
VITE_API_URL=https://kiddiebus-api-XXXXX.herokuapp.com/api npm run build

# Set git remote
heroku git:remote -a kiddiebus-app

# Deploy
git subtree push --prefix frontend heroku main
```

---

## Environment Variables Reference

### Backend (.env)

```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DATABASE_URL=postgresql://localhost/kiddiebus
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Verification

After deployment, verify the application is working:

1. **Backend Health Check**:
   ```bash
   curl https://kiddiebus-api-XXXXX.herokuapp.com/api/health
   ```
   Should return: `{"status": "healthy", "message": "Kiddie Bus API is running"}`

2. **Frontend**: Visit `https://kiddiebus-app-XXXXX.herokuapp.com`
   - You should see the login page
   - Register a new account to test

---

## Troubleshooting

### View Logs

```bash
# Backend logs
heroku logs --tail --app kiddiebus-api

# Frontend logs
heroku logs --tail --app kiddiebus-app
```

### Database Issues

```bash
# Connect to production database
heroku pg:psql --app kiddiebus-api

# Reset database (WARNING: destroys all data)
heroku pg:reset --app kiddiebus-api
heroku run flask db upgrade --app kiddiebus-api
```

### Common Issues

1. **Build fails**: Check that all dependencies are in requirements.txt / package.json
2. **Database connection error**: Verify DATABASE_URL is set correctly
3. **CORS errors**: Backend CORS is configured to allow all origins for `/api/*`
4. **Auth issues**: Ensure JWT_SECRET_KEY matches between environments

---

## Future Enhancements (Phase 2)

These features are planned but not yet implemented:

- [ ] Google Maps integration for real-time tracking
- [ ] Twilio SMS notifications
- [ ] SendGrid email notifications
- [ ] Card/fob NFC reader integration
- [ ] Push notifications

---

## Support

For issues, please open a GitHub issue at:
https://github.com/YOUR_USERNAME/kiddiebus/issues
