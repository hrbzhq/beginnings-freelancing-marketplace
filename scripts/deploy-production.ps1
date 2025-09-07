# Beginnings - Production Deployment Script (PowerShell)
# This script sets up the production environment for the Beginnings freelancing marketplace

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "native")]
    [string]$DeploymentMethod = "docker"
)

Write-Host "🚀 Starting Beginnings production deployment..." -ForegroundColor Green

# Check if required environment variables are set
$requiredVars = @("DATABASE_URL", "NEXTAUTH_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Test-Path "env:$var")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Error: Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green

if ($DeploymentMethod -eq "docker") {
    Write-Host "🐳 Starting Docker deployment..." -ForegroundColor Blue

    # Check if Docker is installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Error: Docker is not installed. Please install Docker first." -ForegroundColor Red
        exit 1
    }

    # Check if docker-compose is available
    $dockerComposeAvailable = $false
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $dockerComposeAvailable = $true
    } else {
        try {
            $null = docker compose version 2>$null
            $dockerComposeAvailable = $true
        } catch {
            # Try alternative command format
            if (Get-Command "docker compose" -ErrorAction SilentlyContinue) {
                $dockerComposeAvailable = $true
            }
        }
    }

    if (-not $dockerComposeAvailable) {
        Write-Host "❌ Error: docker-compose is not available. Please install docker-compose." -ForegroundColor Red
        exit 1
    }

    # Create necessary directories
    New-Item -ItemType Directory -Force -Path "logs", "nginx/ssl" | Out-Null

    # Copy environment file if it exists
    if (Test-Path ".env.production") {
        Write-Host "📋 Using production environment file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: .env.production file not found. Using environment variables." -ForegroundColor Yellow
    }

    # Build and start containers
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose build --no-cache
        Write-Host "🚀 Starting services with docker-compose..." -ForegroundColor Blue
        docker-compose up -d
    } else {
        docker compose build --no-cache
        Write-Host "🚀 Starting services with docker compose..." -ForegroundColor Blue
        docker compose up -d
    }

    # Wait for services to be healthy
    Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    # Run database migrations in container
    Write-Host "🗃️ Running database migrations..." -ForegroundColor Blue
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose exec app npx prisma migrate deploy
    } else {
        docker compose exec app npx prisma migrate deploy
    }

    # Run health check
    Write-Host "🏥 Running health check..." -ForegroundColor Blue
    $maxAttempts = 10
    $attempt = 1
    $healthy = $false

    while ($attempt -le $maxAttempts -and -not $healthy) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Health check passed!" -ForegroundColor Green
                $healthy = $true
            } else {
                Write-Host "⏳ Health check attempt $attempt/$maxAttempts failed, retrying..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⏳ Health check attempt $attempt/$maxAttempts failed, retrying..." -ForegroundColor Yellow
        }

        if (-not $healthy) {
            Start-Sleep -Seconds 10
            $attempt++
        }
    }

    if (-not $healthy) {
        Write-Host "❌ Health check failed after $maxAttempts attempts" -ForegroundColor Red
        exit 1
    }

    Write-Host "" -ForegroundColor Green
    Write-Host "🎉 Docker deployment completed successfully!" -ForegroundColor Green
    Write-Host "" -ForegroundColor Green
    Write-Host "📚 Useful commands:" -ForegroundColor Cyan
    Write-Host "- docker-compose logs -f          # View logs" -ForegroundColor White
    Write-Host "- docker-compose exec app bash    # Access app container" -ForegroundColor White
    Write-Host "- docker-compose restart          # Restart all services" -ForegroundColor White
    Write-Host "- docker-compose down             # Stop all services" -ForegroundColor White

} elseif ($DeploymentMethod -eq "native") {
    Write-Host "🖥️ Starting native deployment..." -ForegroundColor Blue

    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm ci --only=production

    # Generate Prisma client
    Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Blue
    npx prisma generate

    # Run database migrations
    Write-Host "🗃️ Running database migrations..." -ForegroundColor Blue
    npx prisma migrate deploy

    # Build the application
    Write-Host "🔨 Building application..." -ForegroundColor Blue
    npm run build

    # Run security audit
    Write-Host "🔒 Running security audit..." -ForegroundColor Blue
    npm audit --audit-level moderate

    Write-Host "✅ Production build completed successfully!" -ForegroundColor Green

    Write-Host "" -ForegroundColor Green
    Write-Host "🎉 Deployment ready! Next steps:" -ForegroundColor Green
    Write-Host "1. Set up your production database (PostgreSQL)" -ForegroundColor White
    Write-Host "2. Configure Redis for queue management" -ForegroundColor White
    Write-Host "3. Set up Stripe webhooks" -ForegroundColor White
    Write-Host "4. Configure OAuth providers (Google, GitHub)" -ForegroundColor White
    Write-Host "5. Deploy to your hosting platform (Vercel, Railway, etc.)" -ForegroundColor White
    Write-Host "6. Set up monitoring and logging" -ForegroundColor White

    Write-Host "" -ForegroundColor Green
    Write-Host "📚 Useful commands:" -ForegroundColor Cyan
    Write-Host "- npm run start        # Start production server" -ForegroundColor White
    Write-Host "- npm run db:migrate   # Run new migrations" -ForegroundColor White
    Write-Host "- npm run eval:run     # Run evaluation cycle" -ForegroundColor White
    Write-Host "" -ForegroundColor Green

    # Optional: Create a simple health check
    Write-Host "🏥 Running health check..." -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Health check failed - server may not be running" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Health check failed - server may not be running" -ForegroundColor Yellow
    }
}
