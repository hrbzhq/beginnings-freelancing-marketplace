# Database & Queue Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Test connection
npm run db:test
```

### 3. Migrate Existing Data
```bash
# Migrate JSON data to database
npm run db:migrate-data
```

### 4. Set up Redis (for queues)
Make sure Redis is running on your system:
```bash
# On Windows with Redis installed
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 5. Test Prompt Playback
```bash
# Create golden dataset from existing data
npm run prompt:create-golden

# Run prompt playback test
npm run prompt:playback
```

## 📊 Database Schema

### Core Tables
- **Jobs**: Job listings with ratings and skills
- **Employers**: Company information
- **Skills**: Normalized skill tags
- **JobSkill**: Many-to-many relationship between jobs and skills
- **Insights**: Market insights and analytics
- **Reports**: Generated reports for sale
- **Purchases**: Transaction records
- **Users**: User accounts and preferences
- **Subscriptions**: Subscription tiers
- **AnalyticsEvent**: User interaction tracking

### AI & Evaluation Tables
- **PromptTemplate**: Versioned AI prompts
- **Evaluation**: Prompt performance metrics
- **GoldenDataset**: Test samples for evaluation
- **TaskLog**: Queue task tracking

## 🔄 Queue System

### Available Queues
- **scrape-jobs**: Web scraping tasks
- **ai-analysis**: Job analysis with LLM
- **generate-report**: Report generation
- **weekly-evaluation**: Self-evaluation cycle

### Queue Features
- Automatic retry with exponential backoff
- Task deduplication
- Result caching
- Error tracking

## 🧪 Prompt Playback Testing

### Golden Dataset
The system uses a "golden dataset" of manually validated samples to test AI prompt performance.

### Metrics
- **Accuracy**: How close predictions are to expected values
- **Consistency**: Internal coherence of AI responses
- **Bias**: Distribution differences from expected outcomes

### Usage
```bash
# Create golden dataset from existing jobs
npm run prompt:create-golden

# Run evaluation
npm run prompt:playback
```

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/beginnings"
REDIS_URL="redis://localhost:6379"
```

### Database Connection
The system uses Prisma ORM with PostgreSQL. Make sure your database is running and accessible.

### Redis Setup
BullMQ requires Redis for queue management. The default configuration uses `redis://localhost:6379`.

## 📈 Monitoring & Maintenance

### Database Maintenance
```bash
# View migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset
```

### Queue Monitoring
Queues can be monitored through Redis CLI or BullMQ dashboard (if implemented).

### Performance Optimization
- Database indexes are automatically created for common query patterns
- Queue tasks include automatic cleanup of completed jobs
- Prisma client is connection-pooled for optimal performance

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify user permissions

2. **Redis Connection Failed**
   - Check Redis is running on port 6379
   - Verify REDIS_URL in .env

3. **Migration Errors**
   - Ensure database schema is compatible
   - Check for foreign key constraints
   - Run `npm run db:push` to sync schema

4. **Prompt Playback Errors**
   - Ensure Ollama is running
   - Check golden dataset exists
   - Verify AI model availability

## 🎯 Next Steps

After setup is complete:
1. ✅ Database migration completed
2. ⏳ Integrate queues into existing APIs
3. ⏳ Set up automated evaluation pipeline
4. ⏳ Implement caching layer
5. ⏳ Add monitoring dashboard
