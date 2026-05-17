# Use Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install packages
RUN npm install

# Copy all frontend files
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]