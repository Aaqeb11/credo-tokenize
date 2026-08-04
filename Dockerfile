# Stage 1: Dependency installation and build
FROM oven/bun:1.1.18 as builder

WORKDIR /app

# Copy package.json and bun.lock to install dependencies
COPY package.json ./package.json
COPY bun.lock ./bun.lock

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN bun run build

# Stage 2: Production image
FROM oven/bun:1.1.18-alpine

WORKDIR /app

# Copy built application and production dependencies from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Set environment variables for Next.js
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]
