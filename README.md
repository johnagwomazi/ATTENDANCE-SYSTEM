# New Horizons Attendance Management System

New Horizons is a full-stack attendance management platform built for students, managers, and administrators. It combines QR-based attendance check-in, live monitoring, enrollment management, course scheduling, attendance history, and automated absentee marking into one responsive application.

## Overview

The project is split into two applications:

- `frontend/` - React + Vite + Tailwind CSS UI
- `backend/` - Node.js + Express + MySQL API

The system supports three roles:

- `student` - scans or enters a QR/session code to check in, then reviews attendance history
- `manager` - monitors live attendance and expired attempts in real time
- `admin` - manages students, courses, enrollments, schedules, reports, and QR session display

## Key Features

- Role-based authentication with secure HTTP-only cookies
- Responsive dashboards for students, managers, and admins
- QR attendance sessions that refresh automatically
- Manual code entry for students with camera issues
- Real-time live attendance updates through Socket.io
- Attendance history with filters and summaries
- Course management with selectable class days and sessions
- Enrollment management, including editing existing enrollments
- Automatic absent record creation for scheduled classes
- Notification and alert popovers for attendance exceptions
- Mobile bottom navigation and desktop sidebar navigation

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zod
- Zustand
- Axios
- Socket.io Client
- Framer Motion
- Recharts
- Lucide React
- React Hot Toast
- html5-qrcode

### Backend

- Node.js
- Express
- MySQL
- Socket.io
- JWT
- bcryptjs
- mysql2
- cookie-parser
- cors
- dotenv
- express-validator
- node-cron
- qrcode
- uuid

## Project Structure

```txt
ATTENDANCE
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── config
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── lib
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   ├── store
│   │   ├── utils
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── cron
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── validations
│   │   ├── app.js
│   │   └── server.js
│   ├── database
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── package.json
│   └── .env.example
├── README.md
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ recommended
- MySQL 8+ recommended
- npm

### 2. Install dependencies

Install the backend and frontend dependencies separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in both `backend/` and `frontend/`.

#### Backend environment variables

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=new_horizons_attendance_v2
DB_RECOVERY_MODE=false

JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

#### Frontend environment variables

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Database Setup

The backend ships with SQL files in `backend/database/`.

### Create the schema

```bash
mysql -u root -p new_horizons_attendance_v2 < backend/database/schema.sql
```

### Optional seed data

```bash
mysql -u root -p new_horizons_attendance_v2 < backend/database/seed.sql
```

## Running the App

Open two terminals.

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on Vite, usually at `http://localhost:5173`.
The backend runs on the port defined in `backend/.env`.

## Available Scripts

### Backend scripts

From `backend/`:

```bash
npm run dev
npm start
```

### Frontend scripts

From `frontend/`:

```bash
npm run dev
npm run build
npm run preview
```

## Main Application Flows

### Authentication

- Students can register and log in
- Auth is handled with HTTP-only cookies
- Users are redirected based on role

### Student attendance

- Students can scan a QR code or enter the 8-character session code manually
- The attendance screen accepts alphanumeric codes to support cameras that struggle to scan
- Attendance results are shown immediately after check-in

### QR session display

- Admins and managers can display a session QR code
- The session refreshes automatically every 30 seconds
- The visible code is also shown in text form for manual entry

### Course management

- Admins create and edit courses
- Each course uses two selectable weekdays
- Courses also carry a selected session and program date range

### Enrollment management

- Admins assign students to courses
- Students can be enrolled in more than one course
- Existing enrollments can be edited after registration

### Live attendance monitoring

- Managers and admins can view live attendance updates
- Alerts appear for expired or invalid attempts
- Attendance feeds update in real time through Socket.io

### Reports and dashboards

- Admins can view summary dashboards and reports
- Students can review their own attendance history and course schedule
- Managers can monitor daily attendance trends and expired attempts

## API Overview

The backend exposes REST endpoints under `/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Courses

- `POST /api/courses`
- `GET /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

### Schedules

- `POST /api/schedules`
- `GET /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`

### Enrollments

- `POST /api/enrollments`
- `GET /api/enrollments`
- `GET /api/enrollments/:id`
- `PUT /api/enrollments/:id`
- `PATCH /api/enrollments/:id/end-program`

### Attendance sessions

- `POST /api/attendance-sessions/create`

### Attendance

- `POST /api/attendance/checkin`

### Reports

- `GET /api/reports/today`
- `GET /api/reports/weekly`
- `GET /api/reports/monthly`

### Admin student endpoints

- `GET /api/admin/students`
- `GET /api/admin/students/unenrolled`
- `GET /api/admin/students/:id/profile`
- `GET /api/admin/students/:id/attendance`

### Admin enrollment endpoints

- `POST /api/admin/enrollments`

## Real-Time Events

Socket.io is used to push live attendance activity to connected clients.

Common events include:

- `attendance-recorded`
- `expired-checkin-attempt`

Managers subscribe to the manager-facing live feed so they can watch attendance as it happens.

## Data Model Notes

The most important entities are:

- `users`
- `courses`
- `enrollments`
- `schedules`
- `attendance_sessions`
- `attendance`
- `entry_attempts`

Course class days are stored as a JSON array in the course record.
Enrollments link students to courses and track session selection.
Attendance rows are unique per student, course, and date.

## Responsive Design Notes

The UI is intentionally built to be responsive without changing the desktop design language.

- Desktop keeps the current polished layout
- Tablet and mobile shrink typography, spacing, and card density
- Modals and popovers stay within the viewport
- Navigation switches cleanly between sidebar and bottom nav
- Tables and dashboards collapse into more compact layouts on smaller screens

## Troubleshooting

### Backend will not start

- Check your MySQL credentials in `backend/.env`
- Confirm the schema has been imported
- Make sure the database server is running

### Frontend cannot reach the API

- Confirm `VITE_API_URL` points to the backend
- Check that the backend CORS configuration allows the frontend origin

### QR attendance does not scan

- Try manual code entry on the student attendance screen
- Confirm the session is active
- Make sure the code is exactly 8 alphanumeric characters

## Related Docs

- `frontend/README.md`
- `backend/README.md`
- `backend/database/schema.sql`
- `backend/database/seed.sql`

## License

No license has been specified for this repository yet.
