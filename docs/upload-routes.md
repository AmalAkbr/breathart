# Upload Backend Routes

## Overview
Handles image and video uploads, conversion, and storage using ImageKit and Cloudflare R2. Uses Multer for file handling.

## Image Upload
- **POST /api/upload/image** — Upload and convert image to WebP (JWT required)
- **POST /api/upload/profile-image** — Upload and convert profile image (JWT required)
- **POST /api/upload/course-thumbnail** — Upload course thumbnail (JWT required)

## Video Upload
- (Video upload endpoints may be in admin or video routes)

## Security
- File size/type limits enforced by Multer.
- Only authenticated users can upload.
