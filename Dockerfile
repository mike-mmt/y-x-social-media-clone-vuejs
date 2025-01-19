FROM ubuntu:latest
LABEL authors="Mike"

# Stage 1: Build Vue frontend
FROM node:18 as frontend-builder
WORKDIR /app/frontend
# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install
# Copy frontend source code
COPY frontend .
# Build frontend
RUN npm run build

# Stage 2: Build Node.js backend
FROM node:18-slim as backend-builder
WORKDIR /app/backend
# Copy backend package files
COPY backend/package*.json ./
RUN npm install --production
# Copy backend source code
COPY backend .

# Stage 3: Production environment
FROM nginx:alpine
WORKDIR /app

# Install Node.js in the final stage
RUN apk add --update nodejs npm

# Copy backend from backend-builder
COPY --from=backend-builder /app/backend ./backend
# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY ssl/y.crt /etc/nginx/ssl/y.crt
COPY ssl/y.key /etc/nginx/ssl/y.key

# Expose port 80
EXPOSE 80

# Start both nginx and node.js backend using a shell script
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]