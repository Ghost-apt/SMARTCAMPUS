# ==========================================
# Multi-Stage Dockerfile for SmartCampus Frontend
# Stage 1: Build
# Stage 2: Production Nginx Serving
# ==========================================

# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy application source
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Production Nginx Runtime
FROM nginx:alpine AS runner

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx daemon in foreground
CMD ["nginx", "-g", "daemon off;"]
