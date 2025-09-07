import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import ollama from 'ollama';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');
const EVALUATION_LOG = path.join(process.cwd(), 'evaluation-log.json');

interface Metrics {
  date: string;
  userEngagement: number;
  jobViews: number;
  revenue: number;
  apiCalls: number;
  errors: number;
}

interface EvaluationLog {
  timestamp: string;
  evaluation: string;
  optimizations: string;
  metrics: Metrics[];
}

// Run evaluation every 7 days (0 0 */7 * *)
export function startEvaluationScheduler() {
  // For testing, run every hour. Change to '0 0 */7 * *' for weekly
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled 7-day evaluation...');
    await runScheduledEvaluation();
  });

  console.log('Evaluation scheduler started - will run every hour for testing');
}

async function runScheduledEvaluation() {
  try {
    // Read metrics
    let metrics: Metrics[] = [];
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    // Get last 7 days metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMetrics = metrics.filter(m => new Date(m.date) >= sevenDaysAgo);

    if (recentMetrics.length === 0) {
      console.log('No recent metrics found for evaluation');
      return;
    }

    const avgEngagement = recentMetrics.reduce((sum, m) => sum + m.userEngagement, 0) / recentMetrics.length;
    const totalRevenue = recentMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalJobViews = recentMetrics.reduce((sum, m) => sum + m.jobViews, 0);
    const totalApiCalls = recentMetrics.reduce((sum, m) => sum + m.apiCalls, 0);
    const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errors, 0);

    // Self-evaluation prompt
    const evaluationPrompt = `
Analyze the following 7-day metrics for the "beginnings" freelancing marketplace:

METRICS SUMMARY:
- Average user engagement: ${avgEngagement.toFixed(2)}
- Total revenue: $${totalRevenue.toFixed(2)}
- Total job views: ${totalJobViews}
- Total API calls: ${totalApiCalls}
- Total errors: ${totalErrors}
- Days with data: ${recentMetrics.length}

EVALUATION CRITERIA:
1. Business performance: Revenue growth, user engagement trends
2. Technical performance: API reliability, error rates
3. Content quality: Job view patterns, user interaction
4. Market fit: Alignment with freelancing market demands

PROVIDE:
1. Performance assessment (strengths/weaknesses)
2. Revenue optimization opportunities
3. Technical improvements needed
4. Content strategy recommendations
5. Specific actionable improvements

Focus heavily on revenue generation and user acquisition.
`;

    const response = await ollama.chat({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: evaluationPrompt }],
      options: { temperature: 0.7 }
    });

    const evaluation = response.message.content;

    // Generate optimization suggestions
    const optimizationPrompt = `
Based on the evaluation above, suggest 5 specific, actionable improvements that would most impact revenue:

1. Feature enhancement for user acquisition
2. Technical optimization for performance
3. Content improvement for engagement
4. Monetization strategy adjustment
5. Market positioning change

Each suggestion should include:
- What to change
- Expected revenue impact
- Implementation complexity (Low/Medium/High)
- Timeline estimate
`;

    const optResponse = await ollama.chat({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: optimizationPrompt }],
      options: { temperature: 0.5 }
    });

    const optimizations = optResponse.message.content;

    // Log evaluation
    const evaluationEntry: EvaluationLog = {
      timestamp: new Date().toISOString(),
      evaluation,
      optimizations,
      metrics: recentMetrics
    };

    let evaluationHistory: EvaluationLog[] = [];
    if (fs.existsSync(EVALUATION_LOG)) {
      const data = fs.readFileSync(EVALUATION_LOG, 'utf8');
      evaluationHistory = JSON.parse(data);
    }

    evaluationHistory.push(evaluationEntry);

    // Keep only last 10 evaluations
    if (evaluationHistory.length > 10) {
      evaluationHistory = evaluationHistory.slice(-10);
    }

    fs.writeFileSync(EVALUATION_LOG, JSON.stringify(evaluationHistory, null, 2));

    console.log('Scheduled evaluation completed and logged');

    // TODO: Implement auto-optimization based on suggestions
    // This could include:
    // - Adjusting LLM prompts
    // - Modifying scraping parameters
    // - Updating UI based on engagement data

  } catch (error) {
    console.error('Scheduled evaluation error:', error);
  }
}

// Manual trigger for testing
export async function triggerEvaluation() {
  console.log('Manually triggering evaluation...');
  await runScheduledEvaluation();
}
