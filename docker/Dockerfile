# ===========================================
# Multi-stage Dockerfile for NestJS Application
# ===========================================

# ===========================================
# Development stage
# ===========================================
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Install build dependencies
RUN apk add --no-cache \
    g++ \
    make \
    postgresql-client \
    python3

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY jest.config.js ./
COPY jest.result-logger.js ./

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose ports (app and debug)
EXPOSE 3000 9229

# Development command with hot reload
CMD ["npm", "run", "start:dev"]

# ===========================================
# Build stage
# ===========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    g++ \
    make \
    python3

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ===========================================
# Production stage
# ===========================================
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    postgresql-client \
    tini

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Copy built application and production dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs && \
    chown -R nestjs:nodejs /app/uploads /app/logs

# Copy health check script
COPY docker/scripts/healthcheck.js ./healthcheck.js
RUN chown nestjs:nodejs ./healthcheck.js

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node healthcheck.js

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/main.js"]