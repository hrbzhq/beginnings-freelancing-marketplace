# Beginnings - Production Deployment Guide

## 🎯 Deployment Overview

This guide covers the complete production deployment of the Beginnings freelancing marketplace, including Docker containerization, database setup, payment processing, and monitoring.

## 📋 Prerequisites

### System Requirements
- **OS**: Linux/Windows/macOS with Docker support
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 10GB+ free space

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 20+ (for native deployment)
- **Git**: Latest version

### External Services
- **PostgreSQL Database**: Production database
- **Redis**: For queues and caching
- **Stripe Account**: Payment processing
- **OAuth Providers**: Google and GitHub apps
- **Domain**: For production deployment

## 🚀 Quick Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd beginnings

# 2. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your actual values

# 3. Run deployment
./scripts/deploy-production.sh docker
# Or on Windows: .\scripts\deploy-production.ps1 -DeploymentMethod docker
```

### Option 2: Native Deployment

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.production.example .env.production

# 3. Run deployment
./scripts/deploy-production.sh native
# Or on Windows: .\scripts\deploy-production.ps1 -DeploymentMethod native
```

## 🔧 Detailed Configuration

### 1. Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# Database
DATABASE_URL=postgresql://username:password@postgres:5432/beginnings

# Redis
REDIS_URL=redis://redis:6379

# Stripe
STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. SSL Certificates

For HTTPS support, place SSL certificates in `nginx/ssl/`:

```
nginx/ssl/
├── cert.pem    # SSL certificate
└── key.pem     # Private key
```

### 3. Domain Configuration

Update `nginx/nginx.conf` with your domain:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;  # Replace with your domain
    # ... rest of configuration
}
```

## 🗄️ Database Setup

### Using Docker (Recommended)

The `docker-compose.yml` includes PostgreSQL and Redis services that start automatically.

### Using External Services

For production, consider using managed services:

- **Railway**: PostgreSQL and Redis included
- **PlanetScale**: MySQL-compatible database
- **Upstash**: Redis as a service
- **AWS RDS**: Managed PostgreSQL

### Database Migration

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 💳 Stripe Configuration

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Complete account verification
3. Enable test mode for development

### 2. Set Up Products

1. Create subscription products in Stripe Dashboard
2. Note the price IDs for your environment variables
3. Configure webhook endpoints

### 3. Webhook Configuration

```bash
# Add webhook endpoint in Stripe Dashboard
# URL: https://your-domain.com/api/stripe/webhook
# Events: checkout.session.completed, invoice.payment_succeeded, etc.
```

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-domain.com/api/auth/callback/github`

## 🤖 AI Setup (Optional)

For job analysis features:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull required models
ollama pull qwen2.5-coder:7b
ollama pull deepseek-r1:latest

# Start Ollama service
ollama serve
```

## 📊 Monitoring & Logging

### Health Checks

The application includes a health check endpoint:

```bash
curl https://your-domain.com/api/health
```

### Logs

```bash
# Docker deployment
docker-compose logs -f app
docker-compose logs -f nginx

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Monitoring Services

Consider integrating:
- **Sentry**: Error tracking
- **DataDog**: Application monitoring
- **New Relic**: Performance monitoring

## 🚀 Deployment Platforms

### Vercel (Recommended for Next.js)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Railway

1. Create new project
2. Connect PostgreSQL and Redis
3. Deploy from GitHub

### AWS/DigitalOcean

1. Set up VPS
2. Install Docker
3. Run docker-compose
4. Configure reverse proxy

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Database connection**: Check DATABASE_URL format
3. **SSL issues**: Verify certificate paths and permissions
4. **Memory issues**: Increase Docker memory limits

### Health Check Failures

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart services
docker-compose restart
```

### Performance Optimization

1. **Enable gzip compression** (configured in nginx)
2. **Set up caching** headers
3. **Optimize images** and static assets
4. **Configure database indexes**

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build production bundle
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create development migration
npx prisma db push      # Push schema changes

# Docker
docker-compose up -d    # Start all services
docker-compose down     # Stop all services
docker-compose logs -f  # View logs
docker-compose exec app bash  # Access app container

# Deployment
./scripts/deploy-production.sh docker    # Docker deployment
./scripts/deploy-production.sh native    # Native deployment
```

## 🔒 Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables properly configured
- [ ] Database credentials secured
- [ ] API keys and secrets protected
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Regular security updates
- [ ] Backup strategy in place

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration files
3. Test health endpoint
4. Review environment variables
5. Check network connectivity

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** and alerts
3. **Configure backups** for database
4. **Set up CI/CD** for automatic deployments
5. **Document** your deployment process
6. **Monitor performance** and optimize as needed

---

**Happy deploying! 🚀**
