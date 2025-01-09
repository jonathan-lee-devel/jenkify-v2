# Use an official Node.js image as the base image for building
FROM node:22.11.0-alpine3.20 AS builder

# Set working directory
WORKDIR /app

# Copy package and lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the source code
COPY . .

# Build the NestJS application
RUN yarn build

# Use a smaller image for runtime
FROM node:22.11.0-alpine3.20 AS runtime

# Set working directory
WORKDIR /app

# Copy package.json and install
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Entrypoint allows runtime commands
ENTRYPOINT ["node", "dist/main"]
