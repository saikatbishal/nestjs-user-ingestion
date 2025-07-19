# Use the official Node.js 18 image as base
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for dependency caching
COPY package*.json ./

# Install dependencies (including devDependencies for build and test)
RUN npm install

# Copy remaining application files
COPY . .

# Build the application (transpile TypeScript)
RUN npm run build

# Expose application port (default NestJS HTTP port)
EXPOSE 3000

# Set environment variables (production recommended for prod)
ENV NODE_ENV=production

# Use start:prod to run compiled dist code
CMD ["npm", "run", "start:prod"]
