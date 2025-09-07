#!/usr/bin/env ts-node

import 'dotenv/config';
import { scheduleWeeklyEvaluation } from '../src/lib/evaluation-queue';
import { triggerEvaluationNow } from '../src/lib/evaluation-queue';
// import { notificationService } from '../src/lib/notification-service';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'schedule':
      console.log('📅 Scheduling weekly evaluation...');
      await scheduleWeeklyEvaluation();
      console.log('✅ Weekly evaluation scheduled successfully');
      break;

    case 'run':
      console.log('🚀 Running evaluation now...');
      try {
        const result = await triggerEvaluationNow();
        console.log(`✅ Evaluation triggered with job ID: ${result.id}`);

        // Wait for completion (in a real scenario, you'd use job completion events)
        console.log('⏳ Evaluation is running in the background...');
        console.log('📊 Check the dashboard or logs for results');
      } catch (error) {
        console.error('❌ Failed to trigger evaluation:', error);
        process.exit(1);
      }
      break;

    case 'test-notification':
      console.log('📤 Testing notification service...');
      const testData = {
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        metrics: {
          revenue: 1250,
          reportSales: 15,
          subscriptions: 8,
          dau: 245,
          mau: 1200,
          ctrInsights: 3.2,
          apiErrors: 2,
          latencyMsP95: 150
        },
        suggestions: {
          promptSuggestions: [
            {
              name: 'job_analysis',
              reason: 'Improve accuracy for tech jobs'
            }
          ],
          reportIdeas: [
            {
              title: 'AI Skills Demand 2025',
              category: 'Technology',
              estimatedDemand: 8
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
              description: 'API latency increased by 15%',
              recommendation: 'Optimize database queries'
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
        }
      };

      // await notificationService.sendEvaluationReport(testData);
      console.log('✅ Test notification would be sent');
      break;

    default:
      console.log('Usage:');
      console.log('  npm run evaluate:schedule  # Schedule weekly evaluation');
      console.log('  npm run evaluate:run       # Run evaluation immediately');
      console.log('  npm run evaluate:test      # Test notification service');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
