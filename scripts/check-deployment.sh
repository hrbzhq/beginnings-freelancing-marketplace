#!/bin/bash

# Beginnings - Pre-deployment Check Script
# This script validates all requirements before deployment

set -e

echo "🔍 Running pre-deployment checks for Beginnings..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Check Node.js version
echo "📦 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="20.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_status "success" "Node.js version: $NODE_VERSION"
    else
        print_status "error" "Node.js version $NODE_VERSION is below required $REQUIRED_VERSION"
        exit 1
    fi
else
    print_status "error" "Node.js is not installed"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "success" "npm version: $NPM_VERSION"
else
    print_status "error" "npm is not installed"
    exit 1
fi

# Check Docker (for Docker deployment)
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | sed 's/Docker version //' | sed 's/,.*//')
    print_status "success" "Docker version: $DOCKER_VERSION"
else
    print_status "warning" "Docker is not installed (required for Docker deployment)"
fi

# Check docker-compose
echo "🐳 Checking docker-compose..."
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | sed 's/docker-compose version //' | sed 's/,.*//')
    else
        COMPOSE_VERSION=$(docker compose version | sed 's/Docker Compose version v//')
    fi
    print_status "success" "Docker Compose version: $COMPOSE_VERSION"
else
    print_status "warning" "docker-compose is not available (required for Docker deployment)"
fi

# Check environment file
echo "🔧 Checking environment configuration..."
if [ -f ".env.production" ]; then
    print_status "success" "Production environment file exists"

    # Check required environment variables
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET")
    missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.production; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_status "success" "All required environment variables are set"
    else
        print_status "error" "Missing environment variables: ${missing_vars[*]}"
        exit 1
    fi
else
    print_status "error" "Production environment file (.env.production) not found"
    print_status "info" "Copy .env.production.example to .env.production and configure"
    exit 1
fi

# Check SSL certificates (for production)
echo "🔒 Checking SSL certificates..."
if [ -d "nginx/ssl" ]; then
    if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
        print_status "success" "SSL certificates found"
    else
        print_status "warning" "SSL certificates not found in nginx/ssl/"
        print_status "info" "Place cert.pem and key.pem in nginx/ssl/ for HTTPS"
    fi
else
    print_status "warning" "SSL directory not found"
    print_status "info" "Create nginx/ssl/ directory and add certificates for HTTPS"
fi

# Check package.json
echo "📦 Checking package.json..."
if [ -f "package.json" ]; then
    print_status "success" "package.json exists"

    # Check if production dependencies are defined
    if grep -q '"prisma"' package.json && grep -q '"next"' package.json; then
        print_status "success" "Required dependencies found in package.json"
    else
        print_status "error" "Required dependencies not found in package.json"
        exit 1
    fi
else
    print_status "error" "package.json not found"
    exit 1
fi

# Check Prisma schema
echo "🗄️ Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
    print_status "success" "Prisma schema exists"
else
    print_status "error" "Prisma schema not found"
    exit 1
fi

# Check deployment scripts
echo "🚀 Checking deployment scripts..."
if [ -f "scripts/deploy-production.sh" ]; then
    print_status "success" "Deployment script exists"
    if [ -x "scripts/deploy-production.sh" ]; then
        print_status "success" "Deployment script is executable"
    else
        print_status "warning" "Deployment script is not executable"
        chmod +x scripts/deploy-production.sh
        print_status "success" "Made deployment script executable"
    fi
else
    print_status "error" "Deployment script not found"
    exit 1
fi

# Check Docker files
echo "🐳 Checking Docker configuration..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ] && [ -f ".dockerignore" ]; then
    print_status "success" "Docker configuration files exist"
else
    print_status "error" "Docker configuration files missing"
    exit 1
fi

# Check nginx configuration
echo "🌐 Checking Nginx configuration..."
if [ -f "nginx/nginx.conf" ]; then
    print_status "success" "Nginx configuration exists"
else
    print_status "error" "Nginx configuration not found"
    exit 1
fi

# Summary
echo ""
echo "🎯 Pre-deployment check completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your production environment variables in .env.production"
echo "2. Set up SSL certificates in nginx/ssl/"
echo "3. Configure your domain in nginx/nginx.conf"
echo "4. Run database migrations: npx prisma migrate deploy"
echo "5. Deploy using: ./scripts/deploy-production.sh docker"
echo ""
echo "📚 Useful commands:"
echo "- ./scripts/deploy-production.sh docker    # Docker deployment"
echo "- ./scripts/deploy-production.sh native    # Native deployment"
echo "- docker-compose logs -f                   # View logs"
echo "- docker-compose exec app bash             # Access container"
