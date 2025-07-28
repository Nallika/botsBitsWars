#!/bin/bash

# This script starts a local MongoDB container for development.

CONTAINER_NAME="mongodb-local"

# Check if a container with the same name is already running
if [ "$(docker ps -q -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "✅ MongoDB container '${CONTAINER_NAME}' is already running."
    exit 0
fi

# Check if a container with the same name exists but is stopped
if [ "$(docker ps -aq -f status=exited -f name=^/${CONTAINER_NAME}$)" ]; then
    echo "🚀 Starting existing MongoDB container..."
    docker start ${CONTAINER_NAME}
    echo "✅ MongoDB container started."
    exit 0
fi

# If no container exists, create and start a new one
echo "🚀 Creating and starting a new MongoDB container..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart always \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:latest

echo "✅ MongoDB container '${CONTAINER_NAME}' is now running."
echo "🔗 Connection URL: mongodb://localhost:27017"

