# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy app source code
COPY . .

# Expose port
EXPOSE 3000

# Start the service
CMD ["node", "index.js"]
