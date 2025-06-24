#!/bin/bash

# Deploy preparation script for Render
echo "===== Preparing Flash Card App for Render Deployment ====="

# Ensure we're in the project root
cd "$(dirname "$0")"

# Check for render.yaml
if [ ! -f "render.yaml" ]; then
  echo "ERROR: render.yaml not found!"
  exit 1
fi

# Validate frontend package.json
if [ ! -f "frontend/package.json" ]; then
  echo "ERROR: frontend/package.json not found!"
  exit 1
fi

# Validate backend package.json
if [ ! -f "backend/package.json" ]; then
  echo "ERROR: backend/package.json not found!"
  exit 1
fi

# Ensure environment files exist
if [ ! -f "frontend/.env.production" ]; then
  echo "ERROR: frontend/.env.production not found!"
  exit 1
fi

if [ ! -f "backend/.env.production" ]; then
  echo "ERROR: backend/.env.production not found!"
  exit 1
fi

echo "✅ Basic file validation passed"

# Install dependencies for testing
echo "Installing frontend dependencies..."
(cd frontend && npm install --no-audit) || { echo "ERROR: Frontend dependency installation failed"; exit 1; }

echo "Installing backend dependencies..."
(cd backend && npm install --no-audit) || { echo "ERROR: Backend dependency installation failed"; exit 1; }

echo "✅ Dependencies installed"

# Try building frontend to catch any build errors
echo "Testing frontend build..."
(cd frontend && npm run build) || { echo "ERROR: Frontend build failed"; exit 1; }

echo "✅ Frontend build test passed"

echo "===== Preparation complete! ====="
echo "Your Flash Card App is ready for deployment on Render."
echo "Deploy by pushing to your connected repository or by creating a new Blueprint."
echo "See DEPLOY.md for more details."
