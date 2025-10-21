# Use a lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for auto-reload
RUN npm install -g nodemon

# Copy the rest of the app
COPY . .

# Expose app port (adjust if needed)
EXPOSE 3000

# Default command for development
CMD ["nodemon", "app.js", "8080"]
