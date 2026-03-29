# # syntax=docker/dockerfile:1

# ARG NODE_VERSION=22-slim
# ARG VITE_API_URL

# # Base image for all stages (lean runtime)
# FROM node:${NODE_VERSION} AS base
# WORKDIR /app
# ENV NODE_ENV=production

# # Builder image with toolchain for native deps (sharp, node-gyp)
# FROM base AS builder
# RUN apt-get update \
#   && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
#   && rm -rf /var/lib/apt/lists/*

# # ---------- Frontend ----------
# FROM builder AS frontend-deps
# WORKDIR /app/frontend
# COPY frontend/package.json frontend/package-lock.json ./
# RUN npm ci --include=dev

# FROM builder AS frontend-build
# ARG VITE_API_URL
# ENV VITE_API_URL=${VITE_API_URL}
# WORKDIR /app/frontend
# COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
# COPY frontend/ ./
# RUN npm run build

# # ---------- Backend ----------
# FROM builder AS backend-deps
# WORKDIR /app/backend
# COPY backend/package.json backend/package-lock.json ./
# RUN npm ci --omit=dev

# # ---------- Runtime ----------
# FROM node:${NODE_VERSION} AS runtime
# WORKDIR /app
# ENV NODE_ENV=production

# # Copy backend dependencies and source (keeps caching on lockfile changes only)
# COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
# COPY backend/package.json ./backend/package.json
# COPY backend/src ./backend/src

# # Copy built frontend for express static serving
# COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# # Create non-root user
# RUN groupadd -g 1001 breathart \
#   && useradd -m -u 1001 -g breathart breathart \
#   && chown -R breathart:breathart /app

# USER breathart
# EXPOSE 8080 443
# WORKDIR /app/backend
# CMD ["node", "src/index.js"]

ARG NODE_VERSION=22-slim

# ---------- Base ----------
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NODE_ENV=production

# ---------- Builder ----------
FROM base AS builder
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# ---------- Frontend dependencies ----------
FROM builder AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev      
# ---------- Frontend build ----------

FROM builder AS frontend-build
ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_WEB3FORMS_KEY=
ARG VITE_NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WEB3FORMS_KEY=${VITE_WEB3FORMS_KEY}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN  npm run build              

# ---------- Backend dependencies ----------
FROM builder AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# ---------- Runtime ----------
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy backend dependencies + source
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/package.json ./backend/package.json
COPY backend/src ./backend/src

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create non-root user
RUN groupadd -g 1001 breathart \
    && useradd -m -u 1001 -g breathart breathart \
    && chown -R breathart:breathart /app

USER breathart
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "src/index.js"]