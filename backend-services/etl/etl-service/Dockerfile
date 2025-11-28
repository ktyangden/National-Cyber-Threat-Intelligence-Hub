# Use Node Alpine for small image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json for caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Expose nothing (consumer does not serve HTTP)
# EXPOSE 3002 # Only needed if this container runs a server

# Use non-root user for security
USER node

# Run the consumer script
CMD ["node", "index.js"]
