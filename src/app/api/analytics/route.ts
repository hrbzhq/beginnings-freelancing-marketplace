import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json');

interface AnalyticsEvent {
  id: string;
  type: 'insight_click' | 'job_apply' | 'report_view';
  insightType?: string;
  jobId?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, insightType, jobId, userId, metadata } = body;

    const event: AnalyticsEvent = {
      id: Date.now().toString(),
      type,
      insightType,
      jobId,
      userId,
      timestamp: new Date().toISOString(),
      metadata
    };

    // Read existing analytics
    let analytics: AnalyticsEvent[] = [];
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      analytics = JSON.parse(data);
    }

    // Add new event
    analytics.push(event);

    // Write back to file
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let analytics: AnalyticsEvent[] = [];
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      analytics = JSON.parse(data);
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
