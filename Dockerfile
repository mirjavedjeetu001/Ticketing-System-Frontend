# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001

# Change ownership
RUN chown -R frontend:nodejs /usr/src/app
USER frontend

# Build the application
RUN npm run build

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Start the application in preview mode
CMD ["npm", "run", "preview"]