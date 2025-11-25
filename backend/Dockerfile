# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies needed for node-gyp
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Development stage
FROM base AS development
WORKDIR /app
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
WORKDIR /app

# Create data directory for SQLite database persistence
RUN mkdir -p /app/data

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production && npm cache clean --force

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mavit -u 1001

# Change ownership of app directory to mavit user
RUN chown -R mavit:nodejs /app

# Switch to non-root user
USER mavit

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]