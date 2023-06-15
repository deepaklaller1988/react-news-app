# Use an official Node.js runtime as the base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Build the React app for production
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Install project dependencies and start the React app when the container launches
CMD ["sh", "-c", "npm install && npm start"]