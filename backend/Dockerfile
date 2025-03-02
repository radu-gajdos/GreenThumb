# Use an official Node.js runtime as a parent image
FROM node:22.5.1

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Modificam pachetul bcrypt
RUN npm rebuild bcrypt --build-from-source
# Sterge fisierul de compilare typescript
RUN rm -f tsconfig.build.tsbuildinfo

# Copy the rest of the application code
COPY . .

# Install nodemon globally
# RUN npm install -g nodemon
# Expose the port the app runs on
EXPOSE 3005

# Command to run the app in development mode
CMD ["npm", "run", "start:dev"]
