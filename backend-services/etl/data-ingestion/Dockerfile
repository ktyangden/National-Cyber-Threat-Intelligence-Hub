# Use Node Alpine for smallest image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Install KafkaJS dependencies (no extra OS deps needed)
# If you ever need to install kafkajs-native dependencies, you can add them later

# Copy package.json & package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Expose nothing, since this is a producer script
# EXPOSE 9092  # Not needed for producer container

# Use non-root user
USER node

# Run the script
CMD ["node", "index.js"]
