# Feature Roadmap for Kiddie Bus

## Overview
This roadmap outlines the phased development of Kiddie Bus, prioritizing features that enhance safety, efficiency, and communication. Each feature includes actionable implementation tasks that can be executed independently.

---

## Phase 1: Foundation
Focus on implementing essential features that establish core functionality.

### 1. Google OAuth Integration
- **Dependencies:** None
- **Complexity:** Low
- **Objective:** Enable users to securely authenticate using their Google accounts, reducing friction in the onboarding process.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Install Google OAuth dependencies (backend) | `requirements.txt` |
| 1.2 | Create Google OAuth callback endpoint | `backend/app/routes/auth.py` |
| 1.3 | Add Google Sign-In button component | `frontend/src/components/GoogleSignInButton.jsx` |
| 1.4 | Integrate OAuth flow in Login/Register pages | `frontend/src/pages/Login.jsx`, `Register.jsx` |
| 1.5 | Handle account linking for existing users | `backend/app/routes/auth.py` |

---

### 2. Google Maps Integration
- **Dependencies:** None (Bus model already has lat/lng fields)
- **Complexity:** Medium
- **Objective:** Integrate real-time mapping and routing functionalities for bus tracking.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Add Google Maps JavaScript API to frontend | `frontend/index.html`, `frontend/.env` |
| 2.2 | Create reusable MapComponent with bus markers | `frontend/src/components/MapComponent.jsx` |
| 2.3 | Replace TrackBus placeholder with live map | `frontend/src/pages/TrackBus.jsx` |
| 2.4 | Implement real-time location polling (30s interval) | `frontend/src/pages/TrackBus.jsx` |
| 2.5 | Add route polyline visualization on map | `frontend/src/components/MapComponent.jsx` |
| 2.6 | Create operator location updater (driver mode) | `frontend/src/pages/DriverMode.jsx` |

---

### 3. Twilio SMS Notifications
- **Dependencies:** None
- **Complexity:** Medium
- **Objective:** Implement SMS notification capabilities to keep parents and operators informed.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Add phone_number field to User model | `backend/app/models/user.py`, migration |
| 3.2 | Add phone input to Register/Profile pages | `frontend/src/pages/Register.jsx`, `Profile.jsx` |
| 3.3 | Create Twilio service utility | `backend/app/utils/twilio_service.py` |
| 3.4 | Integrate Twilio into notification creation | `backend/app/routes/notifications.py` |
| 3.5 | Add SMS opt-in preference toggle | `frontend/src/pages/Profile.jsx` |
| 3.6 | Add Twilio environment variables to Heroku | Heroku config |

---

### 4. SendGrid Email Notifications
- **Dependencies:** None (email field already exists on User)
- **Complexity:** Medium
- **Objective:** Enable email-based notifications as additional communication channel.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 4.1 | Create SendGrid service utility | `backend/app/utils/sendgrid_service.py` |
| 4.2 | Create email templates (delay, emergency, boarding) | `backend/app/templates/email/` |
| 4.3 | Integrate SendGrid into notification creation | `backend/app/routes/notifications.py` |
| 4.4 | Add email preference toggle in Profile | `frontend/src/pages/Profile.jsx` |
| 4.5 | Add SendGrid environment variables to Heroku | Heroku config |

---

## Phase 2: Growth
Introduce advanced features that enhance user interaction and system robustness.

### 5. Enhanced UI/UX Update
- **Dependencies:** None
- **Complexity:** Medium
- **Objective:** Modernize the application's visual design for better user experience.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 5.1 | Increase whitespace and improve layout spacing | `frontend/src/App.css` |
| 5.2 | Refine typography and establish consistent type scale | `frontend/src/App.css` |
| 5.3 | Update color scheme for brand consistency | `frontend/src/App.css` |
| 5.4 | Add hover effects and micro-animations | Component CSS files |
| 5.5 | Improve mobile responsiveness (mobile-first) | All page components |
| 5.6 | Add loading states and skeleton screens | `frontend/src/components/` |

---

### 6. NFC Card/Fob Reader Integration
- **Dependencies:** None
- **Complexity:** High
- **Objective:** Allow students to use NFC cards/fobs for check-in, streamlining boarding.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 6.1 | Research Web NFC API browser support/limitations | Documentation |
| 6.2 | Create NFC reader component | `frontend/src/components/NFCReader.jsx` |
| 6.3 | Integrate NFC reader into CheckIn page | `frontend/src/pages/CheckIn.jsx` |
| 6.4 | Add card_id assignment UI in StudentForm | `frontend/src/pages/StudentForm.jsx` |
| 6.5 | Create fallback manual card ID entry mode | `frontend/src/pages/CheckIn.jsx` |
| 6.6 | Add NFC card management to operator dashboard | `frontend/src/pages/Students.jsx` |

---

### 7. Push Notifications
- **Dependencies:** Service Worker setup
- **Complexity:** High
- **Objective:** Provide real-time alerts directly on users' devices.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 7.1 | Generate VAPID keys for web push | Backend config |
| 7.2 | Create service worker for push handling | `frontend/public/sw.js` |
| 7.3 | Create push subscription API endpoints | `backend/app/routes/push.py` |
| 7.4 | Add PushSubscription model to database | `backend/app/models/push_subscription.py` |
| 7.5 | Add "Enable notifications" prompt in frontend | `frontend/src/components/PushPrompt.jsx` |
| 7.6 | Integrate web-push sending into notifications | `backend/app/routes/notifications.py` |

---

### 8. Advanced Parent Features
- **Dependencies:** Google Maps, Push Notifications
- **Complexity:** Medium
- **Objective:** Enhance parent experience with ETA updates and trip history.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 8.1 | Calculate and display bus ETA on TrackBus page | `frontend/src/pages/TrackBus.jsx` |
| 8.2 | Send push notification when bus is approaching | `backend/app/routes/notifications.py` |
| 8.3 | Create trip history API endpoint | `backend/app/routes/trips.py` |
| 8.4 | Add trip history page with analytics | `frontend/src/pages/TripHistory.jsx` |

---

## Phase 3: Scale
Focus on regulatory compliance and broader system capabilities.

### 9. Government Compliance Reporting
- **Dependencies:** All data models stable
- **Complexity:** Medium
- **Objective:** Implement reporting features to meet government regulations.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 9.1 | Define report requirements (clarify with stakeholders) | Documentation |
| 9.2 | Create reports API endpoints | `backend/app/routes/reports.py` |
| 9.3 | Add Reports page with date range selectors | `frontend/src/pages/Reports.jsx` |
| 9.4 | Implement PDF export functionality | `backend/app/utils/pdf_generator.py` |
| 9.5 | Implement CSV export functionality | `backend/app/routes/reports.py` |
| 9.6 | Add scheduled report generation (cron job) | `backend/app/utils/scheduler.py` |

---

### 10. Scalability & Infrastructure
- **Dependencies:** Core features complete
- **Complexity:** High
- **Objective:** Prepare infrastructure for growth.

**Implementation Tasks:**
| Task | Description | Files |
|------|-------------|-------|
| 10.1 | Add Redis for caching frequently accessed data | Heroku addon, `backend/config.py` |
| 10.2 | Implement database connection pooling | `backend/config.py` |
| 10.3 | Add request rate limiting | `backend/app/__init__.py` |
| 10.4 | Set up application performance monitoring | Heroku addon |
| 10.5 | Implement database read replicas (if needed) | Infrastructure |

---

## Current Implementation Status

### Already Implemented (Phase 0)
- [x] User authentication (JWT)
- [x] Bus management (CRUD + location fields)
- [x] Route management
- [x] Student registration
- [x] Student check-in system
- [x] In-app notifications
- [x] Dashboard for operators and parents
- [x] Basic TrackBus page (placeholder for maps)

### Ready for Implementation
- [ ] 1. Google OAuth Integration
- [ ] 2. Google Maps Integration
- [ ] 3. Twilio SMS Notifications
- [ ] 4. SendGrid Email Notifications

---

## Risk Factors & Considerations
- **Integration Challenges:** Ensure early testing of third-party services (Google Maps, Twilio, SendGrid)
- **Security Concerns:** Prioritize securing user data, especially phone numbers and location data
- **Browser Support:** Web NFC API has limited browser support (Chrome on Android only)
- **Cost Management:** Monitor Twilio/SendGrid usage to control costs
- **Resource Allocation:** Balance feature complexity with available development resources

---

## Environment Variables Required

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=notifications@kiddiebus.com

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@kiddiebus.com
```
