# New Horizons Attendance Management System Frontend

Premium React frontend for the New Horizons attendance platform.

## Overview

This frontend provides:

- Authentication screens
- Role-based dashboards for students, managers, and admins
- QR attendance check-in flow
- Real-time live attendance monitoring
- Attendance history and reporting
- Responsive sidebar and bottom navigation patterns

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Zustand
- Socket.io Client
- Framer Motion
- React Hook Form
- Zod
- Lucide React
- React Hot Toast
- html5-qrcode
- Recharts

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`.

3. Start the app:

```bash
npm run dev
```

## Environment Variables

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

## Folder Structure

```txt
frontend
├── public
├── src
│   ├── assets
│   ├── layouts
│   ├── pages
│   ├── components
│   ├── services
│   ├── store
│   ├── routes
│   ├── utils
│   ├── lib
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

## Zustand Architecture

### Auth Store

- `user`
- `role`
- `isAuthenticated`
- `loading`

Actions:

- `login`
- `logout`
- `register`
- `fetchCurrentUser`

### Attendance Store

- `todayAttendance`
- `attendanceHistory`
- `statistics`

Actions:

- `checkIn`
- `fetchHistory`
- `fetchStats`

### Admin Store

- `students`
- `courses`
- `enrollments`
- `reports`

Actions:

- `fetchStudents`
- `fetchCourses`
- `fetchEnrollments`
- `fetchReports`

### Socket Store

- `liveAttendance`
- `expiredAttempts`

Actions:

- `connect`
- `disconnect`

## Routing Structure

- `/login`
- `/register`
- `/checkin`
- `/student/dashboard`
- `/student/attendance`
- `/student/profile`
- `/student/history`
- `/manager/dashboard`
- `/manager/live-attendance`
- `/qr-display`
- `/admin/dashboard`
- `/admin/students`
- `/admin/courses`
- `/admin/enrollments`
- `/admin/attendance`
- `/admin/reports`

## Socket Integration

The app connects after authentication and listens for:

- `attendance-recorded`
- `expired-checkin-attempt`

Manager dashboards update in real time without refresh.

## Notes

- API calls live in `src/services`.
- Zustand is used for all global state.
- The frontend is designed to work with the existing backend routes only.
