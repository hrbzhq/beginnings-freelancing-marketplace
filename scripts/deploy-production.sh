#!/bin/bash

# Beginnings - Production Deployment Script
# This script sets up the production environment for the Beginnings freelancing marketplace

set -e

echo "🚀 Starting Beginnings production deployment..."

# Check deployment method
DEPLOY_METHOD=${1:-"docker"}  # Default to docker deployment

if [ "$DEPLOY_METHOD" != "docker" ] && [ "$DEPLOY_METHOD" != "native" ]; then
    echo "❌ Error: Invalid deployment method. Use 'docker' or 'native'"
    echo "Usage: $0 [docker|native]"
    exit 1
fi

echo "📋 Deployment method: $DEPLOY_METHOD"

# Check if required environment variables are set
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var environment variable is not set"
    exit 1
  fi
done

echo "✅ Environment variables validated"

if [ "$DEPLOY_METHOD" = "docker" ]; then
    echo "🐳 Starting Docker deployment..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Error: docker-compose is not available. Please install docker-compose."
        exit 1
    fi

    # Create necessary directories
    mkdir -p logs nginx/ssl

    # Copy environment file if it exists
    if [ -f ".env.production" ]; then
        echo "📋 Using production environment file"
    else
        echo "⚠️ Warning: .env.production file not found. Using environment variables."
    fi

    # Build and start containers
    echo "🔨 Building Docker images..."
    if command -v docker-compose &> /dev/null; then
        docker-compose build --no-cache
        echo "🚀 Starting services with docker-compose..."
        docker-compose up -d
    else
        docker compose build --no-cache
        echo "🚀 Starting services with docker compose..."
        docker compose up -d
    fi

    # Wait for services to be healthy
    echo "⏳ Waiting for services to be healthy..."
    sleep 30

    # Run database migrations in container
    echo "🗃️ Running database migrations..."
    if command -v docker-compose &> /dev/null; then
        docker-compose exec app npx prisma migrate deploy
    else
        docker compose exec app npx prisma migrate deploy
    fi

    # Run health check
    echo "🏥 Running health check..."
    max_attempts=10
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            echo "✅ Health check passed!"
            break
        else
            echo "⏳ Health check attempt $attempt/$max_attempts failed, retrying..."
            sleep 10
            ((attempt++))
        fi
    done

    if [ $attempt -gt $max_attempts ]; then
        echo "❌ Health check failed after $max_attempts attempts"
        exit 1
    fi

    echo ""
    echo "🎉 Docker deployment completed successfully!"
    echo ""
    echo "📚 Useful commands:"
    echo "- docker-compose logs -f          # View logs"
    echo "- docker-compose exec app bash    # Access app container"
    echo "- docker-compose restart          # Restart all services"
    echo "- docker-compose down             # Stop all services"

elif [ "$DEPLOY_METHOD" = "native" ]; then
    echo "🖥️ Starting native deployment..."

    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci --only=production

    # Generate Prisma client
    echo "🗄️ Generating Prisma client..."
    npx prisma generate

    # Run database migrations
    echo "🗃️ Running database migrations..."
    npx prisma migrate deploy

    # Build the application
    echo "🔨 Building application..."
    npm run build

    # Run security audit
    echo "🔒 Running security audit..."
    npm audit --audit-level moderate

    echo "✅ Production build completed successfully!"

    echo ""
    echo "🎉 Deployment ready! Next steps:"
    echo "1. Set up your production database (PostgreSQL)"
    echo "2. Configure Redis for queue management"
    echo "3. Set up Stripe webhooks"
    echo "4. Configure OAuth providers (Google, GitHub)"
    echo "5. Deploy to your hosting platform (Vercel, Railway, etc.)"
    echo "6. Set up monitoring and logging"

    echo ""
    echo "📚 Useful commands:"
    echo "- npm run start        # Start production server"
    echo "- npm run db:migrate   # Run new migrations"
    echo "- npm run eval:run     # Run evaluation cycle"
    echo ""

    # Optional: Create a simple health check
    echo "🏥 Running health check..."
    curl -f http://localhost:3000/api/health || echo "⚠️ Health check failed - server may not be running"
fi
