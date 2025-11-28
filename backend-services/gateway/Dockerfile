FROM node:20-alpine AS build

# Working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./

# Install dependencies cleanly & faster
RUN npm ci --omit=dev

# Copy app source
COPY . .

# -------------------------------
# Final runtime image
# -------------------------------
FROM node:20-alpine

WORKDIR /app

# Copy everything including node_modules from build stage
COPY --from=build /app .

# Set environment variables
ENV NODE_ENV=production

# Expose port (matches your Express PORT)
EXPOSE 3002

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3002/ || exit 1

# Use a non-root user for security
USER node

# Start server (correct entry file)
CMD ["node", "src/index.js"]
