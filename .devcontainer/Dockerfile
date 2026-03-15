FROM node:20-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  netcat-openbsd \
  ca-certificates \
  openssl \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Set working directory
WORKDIR /workspace

# Switch to node user for security
USER node

# Expose common dev ports
EXPOSE 3000 3001 5432 6379 9000 9001 8025
