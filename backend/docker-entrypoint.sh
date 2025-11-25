#!/bin/sh
set -e

echo "🔄 Synchronizing database schema with Prisma..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Database schema synchronized successfully"
echo "🚀 Starting Mavit Backend Server..."

exec npm start
