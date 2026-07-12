# New Horizons Attendance Management System Backend

Production-ready backend for the New Horizons Training Institute attendance platform.

## Overview

This backend provides:

- JWT authentication with secure HTTP-only cookies
- Role-based access control for `admin`, `manager`, and `student`
- Course management
- Student enrollment management
- Dynamic QR attendance sessions
- Attendance check-in validation
- Automatic absent record creation
- Real-time Socket.io notifications
- Attendance reports

## Tech Stack

- Node.js
- Express.js
- MySQL
- Socket.io
- JWT
- bcryptjs
- mysql2
- cookie-parser
- dotenv
- cors
- express-validator
- node-cron
- uuid
- qrcode

## Folder Structure

```txt
backend
├── src
│   ├── config
│   ├── controllers
│   ├── cron
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── validations
│   ├── app.js
│   └── server.js
├── database
├── .env.example
├── package.json
└── README.md
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the values.

3. Import the database schema:

```bash
mysql -u root -p new_horizons_attendance_v2 < database/schema.sql
```

4. Optionally load seed data:

```bash
mysql -u root -p new_horizons_attendance_v2 < database/seed.sql
```

5. Start the backend:

```bash
npm run dev
```

## Environment Variables

```env
PORT=
NODE_ENV=

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_RECOVERY_MODE=

JWT_SECRET=
JWT_EXPIRES_IN=

CLIENT_URL=
```

## Database Setup

The schema is located in `database/schema.sql`.

Tables included:

- `users`
- `courses`
- `enrollments`
- `schedules`
- `attendance_sessions`
- `attendance`
- `entry_attempts`

## Authentication

### Register Student

`POST /api/auth/register`

### Login

`POST /api/auth/login`

### Logout

`POST /api/auth/logout`

### Current User

`GET /api/auth/me`

## Courses

Admin only.

- `POST /api/courses`
- `GET /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

## Schedules

Admin only.

- `POST /api/schedules`
- `GET /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`

## Enrollments

Admin only.

- `POST /api/enrollments`
- `GET /api/enrollments`
- `GET /api/enrollments/:id`
- `PUT /api/enrollments/:id`
- `PATCH /api/enrollments/:id/end-program`

## Attendance Sessions

Admin and manager.

- `POST /api/attendance-sessions/create`

Returns:

- `token`
- `expiresAt`
- `attendanceUrl`
- `qrCodeDataUrl`

## Attendance Check-In

Authenticated student only.

- `POST /api/attendance/checkin`

Request body:

```json
{
  "token": "uuid-token"
}
```

## Reports

Admin and manager.

- `GET /api/reports/today`
- `GET /api/reports/weekly`
- `GET /api/reports/monthly`

Supported query filters:

- `courseId`
- `studentId`
- `from`
- `to`

## Socket Events

### `attendance-recorded`

Emitted when attendance is successfully recorded.

Payload:

```json
{
  "studentName": "",
  "course": "",
  "time": "",
  "status": ""
}
```

### `expired-checkin-attempt`

Emitted when a completed, expired, or suspended student attempts attendance.

Payload:

```json
{
  "studentName": "",
  "course": "",
  "time": ""
}
```

Managers are subscribed to the `managers` socket room.

## Cron Job

The cron job runs daily at `06:00 AM` and automatically inserts `absent` attendance rows for active students enrolled in classes scheduled for that day.

If a student later checks in, the backend updates the existing `absent` row to `present` or `late`.

## Notes

- Cookies are HTTP-only and secure in production.
- All SQL queries use parameterized statements.
- Attendance records are unique per student, course, and date.
