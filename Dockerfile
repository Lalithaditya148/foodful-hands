# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "backend/server.js"]
