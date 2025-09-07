# Beginnings - Freelancing Marketplace

A modern, full-stack freelancing marketplace built with Next.js 15, TypeScript, and production-ready features including AI-powered job analysis and payment processing.

## 🚀 Features

- **AI-Powered Job Analysis**: Uses local LLMs (qwen2.5-coder:7b, deepseek-r1:latest) for intelligent job and employer ratings
- **Data Aggregation**: Scrapes jobs from Upwork and Fiverr using Puppeteer
- **Multi-dimensional Ratings**: Difficulty, prospects, fun for jobs; credit, salary, attitude for employers
- **Self-Evaluation**: 7-day recursive assessment with optimization suggestions
- **User Authentication**: NextAuth.js with Google/GitHub OAuth
- **Payment Processing**: Stripe integration with subscription management
- **Production Ready**: Docker deployment with health checks and monitoring

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI/ML**: Ollama with local LLMs
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Docker, Nginx
- **Scraping**: Puppeteer, Cheerio
- **Scheduling**: Node-cron

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- Ollama with required models
- Stripe account
- OAuth apps (Google, GitHub)

## 🚀 Quick Start with Evaluation System

### 1. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed evaluation data
npm run db:seed-evaluation
```

### 2. AI Model Setup

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull required models
ollama pull qwen2.5-coder:7b
ollama pull deepseek-r1:latest

# Start Ollama service
ollama serve
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your values
# Add Slack/Email notification settings if desired
```

### 4. Start the Evaluation System

```bash
# Schedule weekly evaluations
npm run evaluate:schedule

# Start the evaluation worker
npm run evaluation:start

# Or run evaluation immediately for testing
npm run evaluate:run
```

### 5. Access Dashboard

```bash
# Start the application
npm run dev

# Visit evaluation dashboard
# http://localhost:3000/evaluation
```

## 🖥️ Native Deployment (without Docker)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.production.example .env.production
# Configure your environment variables
```

### 3. Database Setup

```bash
# Install PostgreSQL and Redis locally
# Or use cloud services (Railway, PlanetScale, Upstash)

# Run migrations
npx prisma migrate deploy
```

### 4. Build and Start

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤖 AI-Powered Evaluation System

Beginnings now includes a sophisticated **automated evaluation system** that performs weekly self-analysis and optimization:

### Core Features

- **📊 Automated Metrics Collection**: Tracks revenue, user engagement, system performance
- **🧠 AI-Powered Analysis**: Uses local LLMs to generate insights and recommendations
- **🔄 Continuous Optimization**: Automatically applies low-risk improvements
- **📢 Smart Notifications**: Slack and email alerts for important findings
- **📈 Performance Monitoring**: Real-time system metrics and health checks
- **🎯 Business Intelligence**: Revenue optimization and trend analysis

### Weekly Evaluation Process

1. **Data Aggregation**: Collects metrics from the past week
2. **AI Analysis**: Local LLM analyzes patterns and identifies opportunities
3. **Automated Actions**: Applies safe optimizations automatically
4. **Human Oversight**: Flags high-risk changes for manual review
5. **Reporting**: Generates comprehensive reports and notifications

### Getting Started with Evaluation

```bash
# Schedule weekly evaluations
npm run evaluate:schedule

# Run evaluation immediately
npm run evaluate:run

# Start the evaluation system
npm run evaluation:start

# Test notification system
npm run evaluate:test
```

### Evaluation Dashboard

Access the evaluation dashboard at `/evaluation` to:
- View weekly evaluation reports
- Monitor system performance
- Review AI recommendations
- Track applied changes
- Manage notifications

### Configuration

Add to your `.env.production` file:

```bash
# Slack Notifications
SLACK_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#beginnings-notifications

# Email Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=admin@beginnings.app
```

### What Gets Evaluated

- **Business Metrics**: Revenue, subscriptions, user growth
- **Product Performance**: Report sales, user engagement
- **System Health**: API errors, latency, error rates
- **AI Performance**: Model accuracy, response quality
- **Market Trends**: Demand patterns, competitive analysis

### Automated Optimizations

**Low Risk (Auto-applied):**
- Prompt template optimizations
- Recommendation algorithm weights
- UI/UX improvements
- Performance optimizations

**High Risk (Manual Review):**
- New report creation
- Major feature changes
- Pricing adjustments
- Strategic decisions

### Notification Types

- **📈 Evaluation Reports**: Weekly summary with insights
- **🚨 Risk Alerts**: Critical issues requiring attention
- **💡 Optimization Suggestions**: AI recommendations
- **⚡ System Alerts**: Performance and health notifications

## 🔧 Configuration

### Environment Variables

See `.env.production.example` for all required environment variables.

### Database

The application uses Prisma with PostgreSQL. Schema is defined in `prisma/schema.prisma`.

### Stripe Setup

1. Create a Stripe account
2. Set up products and prices in Stripe Dashboard
3. Configure webhook endpoints for payment events
4. Update environment variables with your Stripe keys

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to your domain

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```
GET /api/health
```

Returns application health status including database connectivity.

### Logs

```bash
# View application logs
docker-compose logs -f app

# View nginx logs
docker-compose logs -f nginx
```

## 🔒 Security

- HTTPS enforced with SSL/TLS
- Rate limiting on API endpoints
- Security headers configured
- Input validation and sanitization
- CSRF protection with NextAuth.js

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

### Payment Endpoints

- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Job Analysis Endpoints

- `GET /api/jobs` - Fetch and analyze jobs from platforms
- `GET /api/evaluate` - Run self-evaluation
- `POST /api/evaluate` - Update metrics

### User Endpoints

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription` - Get subscription status

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment Options

### Docker (Recommended)

```bash
./scripts/deploy-production.sh docker
```

### Vercel

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy

### Railway

1. Create a new project
2. Connect PostgreSQL and Redis
3. Deploy from GitHub

### Manual Server

```bash
./scripts/deploy-production.sh native
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js and modern web technologies.
