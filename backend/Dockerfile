# ==========================================
# Production Dockerfile for SmartCampus Backend
# ==========================================

FROM node:20-alpine

# Install dumb-init for clean process signal handling
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend application source
COPY . .

# Ensure storage & backup directories exist with proper ownership
RUN mkdir -p backups \
    && chown -R node:node /app

# Run as non-root user for security hardening
USER node

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health/live || exit 1

# Start server using dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
