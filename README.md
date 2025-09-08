# Beginnings - AI-Powered Freelancing Marketplace

<div align="center">

![Beginnings Logo](https://img.shields.io/badge/Beginnings-Freelancing_Platform-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjUgMTlIMTQuNUMxNS45IDE4IDE3IDE3LjEgMTcgMTZWMTRDMTcgNS4xIDE1LjkgNCAxNC40IDMuNUwxMiAyWiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4=)

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-green?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red?style=flat-square&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-24.0-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A modern, AI-powered freelancing marketplace that revolutionizes how freelancers find opportunities and clients discover talent.**

[🌐 Live Demo](https://beginnings-freelancing.vercel.app) • [📖 Documentation](https://docs.beginnings.dev) • [🚀 Quick Start](#-quick-start) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📊 API Documentation](#-api-documentation)
- [🗄️ Database Schema](#️-database-schema)
- [🚢 Deployment](#-deployment)
- [🔧 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙋 Support](#-support)

---

## ✨ Features

### 🤖 AI-Powered Intelligence

- **Smart Job Analysis**: Advanced AI evaluation using local LLMs (qwen2.5-coder:7b, deepseek-r1:latest)
- **Automated Report Generation**: AI creates comprehensive market reports and insights
- **Intelligent Recommendations**: Personalized job and freelancer matching
- **Self-Learning System**: 7-day recursive evaluation with continuous optimization

### 💼 Comprehensive Marketplace

- **Multi-Platform Integration**: Scrapes and aggregates jobs from Upwork, Fiverr, and more
- **Advanced Filtering**: Location, skills, budget, experience level filtering
- **Real-time Updates**: Live job market data with instant notifications
- **Quality Assurance**: Multi-dimensional rating system for jobs and employers

### 📊 Business Intelligence

- **Market Insights Dashboard**: Interactive charts and analytics
- **Trend Analysis**: Salary trends, demand forecasting, skill popularity
- **Custom Reports**: Enterprise-grade reporting with export capabilities
- **Performance Metrics**: Comprehensive analytics for platform optimization

### 🔒 Enterprise-Ready

- **Production Security**: OAuth2, JWT, rate limiting, encryption
- **Compliance**: GDPR, CCPA compliance with data export/deletion
- **Scalable Architecture**: Microservices-ready with Docker support
- **Monitoring**: Health checks, logging, error tracking

---

## 🏗️ Architecture

```mermaid
graph TB
    A[Next.js Frontend] --> B[API Routes]
    B --> C[Prisma ORM]
    C --> D[(PostgreSQL)]
    B --> E[Redis Cache]
    B --> F[BullMQ Queue]
    F --> G[AI Evaluation Worker]
    G --> H[Ollama LLM]
    B --> I[Stripe Payments]
    B --> J[NextAuth.js]

    subgraph "External Services"
        K[Upwork API]
        L[Fiverr API]
        M[GitHub OAuth]
        N[Google OAuth]
    end

    A --> M
    A --> N
    B --> K
    B --> L
```

### Core Components

- **Frontend Layer**: Next.js 15 with App Router, React 18, TypeScript
- **API Layer**: RESTful APIs with comprehensive error handling
- **Data Layer**: Prisma ORM with PostgreSQL and Redis caching
- **AI Layer**: Local LLM integration with Ollama
- **Queue System**: BullMQ for background job processing
- **Authentication**: NextAuth.js with multiple OAuth providers
- **Payment**: Stripe integration with subscription management

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context API
- **Charts**: Recharts for data visualization

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7.0
- **Queue**: BullMQ + Redis
- **Authentication**: NextAuth.js

### AI & ML
- **LLM**: Ollama with qwen2.5-coder:7b, deepseek-r1:latest
- **Embeddings**: Local vector processing
- **Evaluation**: Custom AI pipeline for job analysis
- **Report Generation**: Automated content creation

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2
- **CI/CD**: GitHub Actions
- **Monitoring**: Health checks + logging

### External Integrations
- **Payments**: Stripe API
- **OAuth**: Google, GitHub
- **Job Sources**: Upwork, Fiverr APIs
- **Email**: SMTP integration

---

## � Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** & Docker Compose ([Download](https://www.docker.com/))
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)
- **Ollama** ([Download](https://ollama.ai/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/hrbzhq/beginnings-freelancing-marketplace.git
cd beginnings-freelancing-marketplace
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/beginnings"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Ollama
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="qwen2.5-coder:7b"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Ollama models
ollama pull qwen2.5-coder:7b
ollama pull deepseek-r1:latest
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Server

```bash
# Start the application
npm run dev

# Application will be available at http://localhost:3000
```

### 6. Access the Application

- **Main Dashboard**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Documentation**: http://localhost:3000/api/docs

---

## 📊 API Documentation

### Core Endpoints

#### Jobs API
```http
GET    /api/jobs              # List jobs with filtering
GET    /api/jobs/:id          # Get job details
POST   /api/jobs              # Create new job
PUT    /api/jobs/:id          # Update job
DELETE /api/jobs/:id          # Delete job
```

#### AI Evaluation API
```http
POST   /api/evaluation/trigger    # Trigger AI evaluation
GET    /api/evaluation/results    # Get evaluation results
GET    /api/evaluation/metrics    # Get evaluation metrics
```

#### Reports API
```http
GET    /api/reports               # List available reports
GET    /api/reports/:id           # Get report details
POST   /api/reports/purchase      # Purchase report
GET    /api/reports/download/:id  # Download report
```

#### User Management
```http
GET    /api/users                 # List users
GET    /api/users/:id             # Get user profile
PUT    /api/users/:id             # Update user
DELETE /api/users/:id             # Delete user
```

### Authentication

The API uses NextAuth.js for authentication. Include the session token in requests:

```javascript
const response = await fetch('/api/jobs', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`
  }
});
```

---

## �️ Database Schema

### Core Tables

```sql
-- Users and Authentication
users (id, email, name, role, created_at, updated_at)
accounts (id, user_id, provider, provider_id)
sessions (id, user_id, expires)

-- Jobs and Marketplace
jobs (id, title, description, budget, employer_id, status, created_at)
employers (id, name, website, rating, created_at)
job_skills (job_id, skill_id)
skills (id, name, category)

-- AI Evaluation System
evaluations (id, period_start, period_end, metrics, suggestions, created_at)
evaluation_suggestions (id, evaluation_id, type, content, status)
report_drafts (id, evaluation_id, title, content, status, created_at)

-- Business Intelligence
analytics_events (id, user_id, type, data, timestamp)
system_metrics (id, metric, value, timestamp)
market_insights (id, skill, trend, confidence, created_at)

-- Payments and Subscriptions
subscriptions (id, user_id, plan, status, stripe_id, created_at)
purchases (id, user_id, report_id, amount, stripe_id, created_at)
```

### Key Relationships

- **Users** → **Jobs** (One-to-Many)
- **Jobs** → **Skills** (Many-to-Many)
- **Evaluations** → **Report Drafts** (One-to-Many)
- **Users** → **Subscriptions** (One-to-Many)
- **Users** → **Purchases** (One-to-Many)

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration

**Production Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:prod_pass@prod_host:5432/beginnings_prod"
REDIS_URL="redis://prod_redis:6379"
NEXTAUTH_URL="https://yourdomain.com"
STRIPE_SECRET_KEY="sk_live_..."
```

### Infrastructure Requirements

- **CPU**: 2+ cores
- **RAM**: 4GB+ minimum, 8GB+ recommended
- **Storage**: 20GB+ for database and logs
- **Network**: Stable internet connection for API calls

---

## 🔧 Development

### Project Structure

```
beginnings-freelancing-marketplace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   ├── forms/            # Form components
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── ai/               # AI/ML utilities
│   │   ├── auth/             # Authentication
│   │   ├── db/               # Database utilities
│   │   └── ...
│   └── middleware.ts          # Next.js middleware
├── prisma/                    # Database schema
├── public/                    # Static assets
├── scripts/                   # Build and utility scripts
├── docker/                    # Docker configurations
└── docs/                      # Documentation
```

### Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:push         # Push schema changes
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# AI & Evaluation
npm run eval:run        # Run evaluation manually
npm run eval:schedule   # Schedule weekly evaluation
npm run eval:test       # Test evaluation system
```

### Code Quality

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier for consistent code style
- **Type Checking**: Strict TypeScript configuration
- **Testing**: Jest for unit and integration tests

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Areas for Contribution

- **AI/ML**: Improve evaluation algorithms, add new LLM models
- **Frontend**: Enhance UI/UX, add new features
- **Backend**: Optimize APIs, improve performance
- **DevOps**: Docker improvements, CI/CD enhancements
- **Documentation**: API docs, user guides, tutorials

### Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Beginnings Freelancing Marketplace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙋 Support

### Getting Help

- **📖 Documentation**: [docs.beginnings.dev](https://docs.beginnings.dev)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/hrbzhq/beginnings-freelancing-marketplace/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/hrbzhq/beginnings-freelancing-marketplace/discussions)
- **📧 Email**: support@beginnings.dev

### Community

- **🌐 Website**: [beginnings.dev](https://beginnings.dev)
- **🐦 Twitter**: [@BeginningsDev](https://twitter.com/BeginningsDev)
- **💼 LinkedIn**: [Beginnings](https://linkedin.com/company/beginnings-dev)
- **📺 YouTube**: [Beginnings Channel](https://youtube.com/@beginnings-dev)

### Professional Support

For enterprise support, custom development, or consulting services:

- **Enterprise License**: Advanced features and priority support
- **Custom Development**: Tailored solutions for your business
- **Training**: Team training and onboarding support

Contact us at [enterprise@beginnings.dev](mailto:enterprise@beginnings.dev) for more information.

---

## 🙏 Acknowledgments

- **Open Source Community**: For the amazing tools and libraries
- **Contributors**: For their valuable contributions and feedback
- **Beta Testers**: For helping us improve the platform
- **Freelancers**: For inspiring us to build better tools

---

<div align="center">

**Made with ❤️ by the Beginnings Team**

[⭐ Star us on GitHub](https://github.com/hrbzhq/beginnings-freelancing-marketplace) • [🐛 Report Issues](https://github.com/hrbzhq/beginnings-freelancing-marketplace/issues) • [💬 Join Discussions](https://github.com/hrbzhq/beginnings-freelancing-marketplace/discussions)

</div>
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
