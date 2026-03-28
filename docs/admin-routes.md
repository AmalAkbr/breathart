# Admin Backend Routes

## Overview
Admin routes are protected endpoints for managing exams, users, and videos. Only users with admin privileges (role: 'admin', isAdmin: true) can access these routes.

## Enabling Admin Privileges
- **POST /api/admin/enable-admin**
  - Authenticated users with `role: 'admin'` but `isAdmin: false` can enable admin mode.
  - Requires valid JWT token.

## Exam Management
- **GET /api/admin/exams** — List all exams
- **GET /api/admin/exams/:id** — Get exam details with participants
- **GET /api/admin/students** — Search available students for exams
- **POST /api/admin/exams** — Create a new exam
- **POST /api/admin/exams/:id/add-participants** — Add participants to an exam
- **POST /api/admin/exams/:id/send-invitations** — Send invitations to exam participants
- **PUT /api/admin/exams/:id** — Update exam details
- **DELETE /api/admin/exams/:id** — Delete an exam

## Video Management
- **POST /api/admin/videos** — Upload video metadata (admin only)
- (Other video management routes may exist in videoService)

## Security
- All routes require admin authentication (JWT + admin middleware).
- Unauthorized access returns 401/403 errors.
