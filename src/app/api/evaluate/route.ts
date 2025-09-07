import { NextResponse } from 'next/server';
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');

interface Metrics {
  date: string;
  userEngagement: number;
  jobViews: number;
  revenue: number;
  apiCalls: number;
  errors: number;
}

export async function GET() {
  try {
    // Read current metrics
    let metrics: Metrics[] = [];
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    // Get last 7 days metrics
    const lastWeek = metrics.slice(-7);
    const avgEngagement = lastWeek.reduce((sum, m) => sum + m.userEngagement, 0) / lastWeek.length || 0;
    const totalRevenue = lastWeek.reduce((sum, m) => sum + m.revenue, 0);

    // Self-evaluation prompt
    const evaluationPrompt = `
Analyze the following metrics for the freelancing marketplace app "beginnings":

Last 7 days metrics:
- Average user engagement: ${avgEngagement.toFixed(2)}
- Total revenue: $${totalRevenue.toFixed(2)}
- Total job views: ${lastWeek.reduce((sum, m) => sum + m.jobViews, 0)}
- API calls: ${lastWeek.reduce((sum, m) => sum + m.apiCalls, 0)}
- Errors: ${lastWeek.reduce((sum, m) => sum + m.errors, 0)}

Evaluate:
1. Content quality: How well are jobs being rated and presented?
2. Model performance: Are LLM analyses accurate and useful?
3. Program logic: Any optimization opportunities?
4. Revenue potential: How can we improve monetization?

Provide specific recommendations for improvement, focusing on revenue generation.
`;

    const response = await ollama.chat({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: evaluationPrompt }]
    });

    const evaluation = response.message.content;

    // Generate optimization suggestions
    const optimizationPrompt = `
Based on the evaluation above, suggest 3 specific code optimizations or feature additions that would most improve revenue generation.

Focus on:
- Better job matching
- Improved ratings accuracy
- Enhanced user experience
- New monetization features

Respond with actionable suggestions.
`;

    const optResponse = await ollama.chat({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: optimizationPrompt }]
    });

    const optimizations = optResponse.message.content;

    return NextResponse.json({
      evaluation,
      optimizations,
      metrics: lastWeek,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMetrics: Metrics = {
      date: new Date().toISOString().split('T')[0],
      userEngagement: body.userEngagement || 0,
      jobViews: body.jobViews || 0,
      revenue: body.revenue || 0,
      apiCalls: body.apiCalls || 0,
      errors: body.errors || 0
    };

    let metrics: Metrics[] = [];
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    metrics.push(newMetrics);

    // Keep only last 30 days
    if (metrics.length > 30) {
      metrics = metrics.slice(-30);
    }

    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Metrics update error:', error);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}
