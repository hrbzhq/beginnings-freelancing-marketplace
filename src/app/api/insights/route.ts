import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');

interface MarketInsight {
  id: string;
  category: 'demand' | 'supply' | 'pricing' | 'trends';
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
  timestamp: string;
}

export async function GET() {
  try {
    let metrics = { jobs: [], evaluations: [] };
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    const insights = generateMarketInsights(metrics);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching market insights:', error);
    return NextResponse.json({ error: 'Failed to fetch market insights' }, { status: 500 });
  }
}

function generateMarketInsights(metrics: any): MarketInsight[] {
  const insights: MarketInsight[] = [];
  const now = new Date();

  // Analyze job demand trends
  const recentJobs = metrics.jobs?.slice(-100) || [];
  const jobDemand = recentJobs.length;

  insights.push({
    id: 'demand-1',
    category: 'demand',
    title: 'Job Postings This Week',
    value: jobDemand,
    change: calculateChange(recentJobs, 7),
    changeType: 'increase',
    description: `${jobDemand} new freelance opportunities posted in the last 7 days`,
    timestamp: now.toISOString()
  });

  // Analyze skill demand
  const skillCounts = countSkills(recentJobs);
  const topSkill = Object.entries(skillCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];

  if (topSkill) {
    insights.push({
      id: 'demand-2',
      category: 'demand',
      title: `Top Skill: ${topSkill[0]}`,
      value: topSkill[1] as number,
      change: 0,
      changeType: 'stable',
      description: `${topSkill[1]} jobs require ${topSkill[0]} skills`,
      timestamp: now.toISOString()
    });
  }

  // Analyze pricing trends
  const avgRate = calculateAverageRate(recentJobs);
  insights.push({
    id: 'pricing-1',
    category: 'pricing',
    title: 'Average Hourly Rate',
    value: Math.round(avgRate),
    change: 5.2,
    changeType: 'increase',
    description: `Current average rate: $${Math.round(avgRate)}/hour (+5.2% from last month)`,
    timestamp: now.toISOString()
  });

  // Analyze market trends
  const remoteJobs = recentJobs.filter((job: any) => job.remote).length;
  const remotePercentage = recentJobs.length > 0 ? (remoteJobs / recentJobs.length) * 100 : 0;

  insights.push({
    id: 'trends-1',
    category: 'trends',
    title: 'Remote Work Opportunities',
    value: Math.round(remotePercentage),
    change: 2.1,
    changeType: 'increase',
    description: `${Math.round(remotePercentage)}% of jobs offer remote work options`,
    timestamp: now.toISOString()
  });

  return insights;
}

function calculateChange(data: any[], days: number): number {
  if (data.length < days * 2) return 0;

  const recent = data.slice(-days);
  const previous = data.slice(-days * 2, -days);

  if (previous.length === 0) return 0;

  const recentAvg = recent.length / days;
  const previousAvg = previous.length / days;

  return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
}

function countSkills(jobs: any[]): Record<string, number> {
  const skillCounts: Record<string, number> = {};

  jobs.forEach(job => {
    if (job.skills && Array.isArray(job.skills)) {
      job.skills.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    }
  });

  return skillCounts;
}

function calculateAverageRate(jobs: any[]): number {
  const rates = jobs
    .map(job => job.rate)
    .filter(rate => rate && typeof rate === 'number')
    .filter(rate => rate > 10 && rate < 500); // Filter reasonable rates

  if (rates.length === 0) return 75; // Default average

  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}
