# Kiddie Bus

A school bus transportation management application designed for small to medium-sized bus operators in Jamaica. Kiddie Bus replaces manual spreadsheet systems with an efficient, digital solution for managing routes, tracking buses, and communicating with parents.

## Features

### For Bus Operators
- **Route Management**: Create and manage bus routes with schedules and assigned buses
- **Bus Fleet Management**: Track all buses with registration, capacity, and status
- **Student Check-In**: Verify student boarding using card/fob ID system
- **Parent Notifications**: Send alerts about delays, emergencies, or schedule changes
- **Dashboard**: Overview of routes, students, and system status

### For Parents
- **Bus Tracking**: View real-time location of your child's bus (Phase 2)
- **Notifications**: Receive alerts about schedule changes and delays
- **Child Management**: Register and manage your children's information
- **Boarding History**: View check-in/check-out records

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Vite, React Router, Zustand |
| Backend | Python 3.11, Flask, SQLAlchemy |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Deployment | Heroku |
| CI/CD | GitHub Actions |

## Project Structure

```
kiddiebus/
├── backend/
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   ├── config.py           # App configuration
│   ├── run.py              # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── Procfile            # Heroku process file
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── store/          # State management
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/      # CI/CD configuration
└── DEPLOYMENT_INSTRUCTIONS.md
```

## Quick Start

### Prerequisites

- Node.js >= 18.x
- Python 3.11+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create database
createdb kiddiebus

# Set up environment
cp .env.example .env

# Run migrations
flask db init
flask db migrate -m "Initial"
flask db upgrade

# Start server
python run.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000` to access the application.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Buses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buses` | List all buses |
| POST | `/api/buses` | Create new bus |
| PUT | `/api/buses/:id` | Update bus |
| PUT | `/api/buses/:id/location` | Update bus location |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | List all routes |
| POST | `/api/routes` | Create new route |
| PUT | `/api/routes/:id` | Update route |
| GET | `/api/routes/:id/students` | Get students on route |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students |
| POST | `/api/students` | Register student |
| GET | `/api/students/card/:cardId` | Find student by card |
| POST | `/api/students/:id/checkin` | Record boarding |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications` | Send notification |
| POST | `/api/notifications/broadcast` | Broadcast to multiple users |
| PUT | `/api/notifications/:id/read` | Mark as read |

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access |
| **Operator** | Manage buses, routes, students, send notifications |
| **Parent** | View children, track buses, receive notifications |

## Deployment

See [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md) for detailed deployment steps.

### Quick Deploy to Heroku

```bash
# Create apps
heroku create kiddiebus-api
heroku create kiddiebus-app
heroku addons:create heroku-postgresql:essential-0 --app kiddiebus-api

# Configure
heroku config:set SECRET_KEY=<secret> JWT_SECRET_KEY=<jwt-secret> --app kiddiebus-api

# Deploy via GitHub Actions (push to main)
git push origin main
```

## Roadmap

### Phase 1 (Current)
- [x] User authentication (operators, parents)
- [x] Bus management
- [x] Route management
- [x] Student registration
- [x] Student check-in system
- [x] In-app notifications
- [x] Dashboard for operators and parents

### Phase 2 (Planned)
- [ ] Google Maps integration for real-time tracking
- [ ] Twilio SMS notifications
- [ ] SendGrid email notifications
- [ ] NFC card/fob reader integration
- [ ] Push notifications
- [ ] Government compliance reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for school bus operators in Jamaica.

## Support

For issues or feature requests, please open a GitHub issue.
