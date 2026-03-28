# Video Backend Routes

## Overview
Public and admin endpoints for video listing, details, and management.

## Public Endpoints
- **GET /api/videos/** — List all videos
- **GET /api/videos/:videoId** — Get video details by ID

## Admin Endpoints
- **POST /api/videos/** — Create a new video (admin only)
- **PUT /api/videos/:videoId** — Update video (admin only)
- **DELETE /api/videos/:videoId** — Delete video (admin only)

## Security
- Admin endpoints require JWT and admin privileges.
- Public endpoints are open to all users.
