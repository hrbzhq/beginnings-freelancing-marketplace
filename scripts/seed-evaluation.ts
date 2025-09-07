import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding evaluation system data...');

  // Create default recommendation configuration
  const existingConfig = await prisma.recommendationConfig.findFirst({
    where: { isActive: true }
  });

  if (!existingConfig) {
    await prisma.recommendationConfig.create({
      data: {
        name: 'default',
        weights: {
          skillWeight: 0.35,
          experienceWeight: 0.25,
          locationWeight: 0.20,
          salaryWeight: 0.15,
          companyWeight: 0.05
        },
        parameters: {
          maxRecommendations: 10,
          minScore: 0.3,
          diversityFactor: 0.7
        },
        isActive: true,
        version: 1
      }
    });
    console.log('✅ Created default recommendation configuration');
  }

  // Create sample evaluation data for testing
  const evaluationCount = await prisma.evaluation.count();
  if (evaluationCount === 0) {
    await prisma.evaluation.create({
      data: {
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        revenue: 1250,
        reportSales: 15,
        subscriptions: 8,
        dau: 245,
        mau: 1200,
        ctrInsights: 3.2,
        apiErrors: 2,
        latencyMsP95: 150,
        suggestions: {
          promptSuggestions: [
            {
              name: 'job_analysis',
              currentTemplate: 'Analyze this job posting...',
              newTemplate: 'Perform comprehensive analysis of this job opportunity...',
              reason: 'Improve depth of analysis for better insights'
            }
          ],
          reportIdeas: [
            {
              title: 'AI Skills Demand 2025',
              description: 'Comprehensive analysis of AI skill requirements across industries',
              category: 'Technology',
              estimatedDemand: 8,
              reason: 'High market demand for AI-related skills'
            }
          ],
          weightAdjustments: {
            skillWeight: 0.4,
            experienceWeight: 0.3,
            locationWeight: 0.2,
            salaryWeight: 0.1
          },
          riskAlerts: [
            {
              type: 'Performance',
              severity: 'medium',
              description: 'API latency increased by 15% this week',
              recommendation: 'Optimize database queries and consider caching'
            }
          ]
        },
        appliedChanges: {
          weightAdjustments: {
            skillWeight: 0.4,
            experienceWeight: 0.3,
            locationWeight: 0.2,
            salaryWeight: 0.1
          }
        },
        status: 'applied'
      }
    });
    console.log('✅ Created sample evaluation data');
  }

  // Create sample notifications
  const notificationCount = await prisma.notification.count();
  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          type: 'evaluation_complete',
          title: 'Weekly Evaluation Complete',
          message: 'AI analysis completed with optimization recommendations',
          priority: 'normal',
          metadata: {
            evaluationId: 'sample-1',
            insights: 5,
            optimizations: 3
          }
        },
        {
          type: 'risk_alert',
          title: 'Performance Alert',
          message: 'API latency has increased by 15%. Consider optimization.',
          priority: 'high',
          metadata: {
            metric: 'latency',
            change: 15,
            threshold: 10
          }
        }
      ]
    });
    console.log('✅ Created sample notifications');
  }

  console.log('🎉 Evaluation system seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
