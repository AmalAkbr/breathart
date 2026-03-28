# Auth Backend Routes

## Overview
Authentication routes for user sign-up, login, email verification, password reset, and profile management.

## Public Endpoints
- **POST /api/auth/signup** — Register a new user
- **POST /api/auth/login** — Login with email and password
- **POST /api/auth/verify-email** — Verify email address
- **POST /api/auth/forgot-password** — Request password reset
- **POST /api/auth/reset-password** — Reset password
- **POST /api/auth/resend-verification** — Resend email verification

## Protected Endpoints
- **GET /api/auth/profile** — Get user profile (requires JWT)
- **POST /api/auth/logout** — Logout (requires JWT)

## Notes
- All protected routes require a valid JWT token in the Authorization header.
