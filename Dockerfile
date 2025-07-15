# Base image with Node.js
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy only the package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies including dev ones
RUN npm install

# Copy the rest of the codebase
COPY . .

# Run the build scripts (Vite + Esbuild)
RUN npm run build

# --- Runtime container ---
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Serve the app
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/server.js"]
