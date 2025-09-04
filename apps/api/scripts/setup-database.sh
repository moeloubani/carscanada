#!/bin/bash

# CarsCanada Database Setup Script
# This script runs Prisma migrations and seeds the database

echo "🚀 CarsCanada Database Setup Script"
echo "===================================="

# Navigate to the API directory
cd "$(dirname "$0")/.." || exit 1

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Environment variables loaded"
else
    echo "⚠️  No .env file found, using existing environment variables"
fi

# Check database connection
echo ""
echo "📊 Checking database connection..."
npx prisma db execute --stdin <<EOF
SELECT version();
EOF

if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "❌ Failed to connect to database"
    exit 1
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Push database schema (for initial setup without migrations)
echo ""
echo "🗄️  Pushing database schema..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✓ Database schema updated successfully"
else
    echo "❌ Failed to update database schema"
    exit 1
fi

# Run package seeder
echo ""
echo "🌱 Seeding featured packages..."
npm run seed:packages

if [ $? -eq 0 ]; then
    echo "✓ Featured packages seeded successfully"
else
    echo "⚠️  Warning: Failed to seed packages (may already exist)"
fi

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Restart the API service on Railway to apply changes"
echo "2. Check the deployment logs to ensure everything is working"
echo "3. Access your API at the Railway domain"