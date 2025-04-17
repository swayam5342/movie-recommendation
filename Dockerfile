FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build the React app
COPY . .
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose the port and start the app
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
