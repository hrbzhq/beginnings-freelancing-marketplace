import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');
const USERS_FILE = path.join(process.cwd(), 'users.json');

interface PersonalizedInsight {
  id: string;
  skill: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
  relevance: 'high' | 'medium' | 'low';
  timestamp: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user data
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(data);
    }

    const user = users.find((u: any) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get metrics data
    let metrics = { jobs: [], evaluations: [] };
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    const personalizedInsights = generatePersonalizedInsights(user.skills, metrics);

    return NextResponse.json({
      userId,
      userName: user.name,
      skills: user.skills,
      insights: personalizedInsights
    });
  } catch (error) {
    console.error('Error fetching personalized insights:', error);
    return NextResponse.json({ error: 'Failed to fetch personalized insights' }, { status: 500 });
  }
}

function generatePersonalizedInsights(userSkills: string[], metrics: any): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = [];
  const now = new Date();

  userSkills.forEach(skill => {
    const skillJobs = metrics.jobs?.filter((job: any) =>
      job.skills?.some((jobSkill: string) =>
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    ) || [];

    if (skillJobs.length > 0) {
      // Calculate demand trend
      const recentJobs = skillJobs.slice(-50);
      const demandChange = calculateChange(recentJobs, 7);

      insights.push({
        id: `personal-${skill}-${Date.now()}`,
        skill,
        title: `${skill} Market Demand`,
        value: skillJobs.length,
        change: demandChange,
        changeType: demandChange > 0 ? 'increase' : demandChange < 0 ? 'decrease' : 'stable',
        description: `${skillJobs.length} jobs require ${skill} skills in the last 30 days`,
        relevance: 'high',
        timestamp: now.toISOString()
      });

      // Calculate average rate
      const avgRate = calculateAverageRate(skillJobs);
      if (avgRate > 0) {
        insights.push({
          id: `salary-${skill}-${Date.now()}`,
          skill,
          title: `${skill} Average Rate`,
          value: Math.round(avgRate),
          change: 3.2, // Mock change - in production, calculate from historical data
          changeType: 'increase',
          description: `Average hourly rate for ${skill} skills: $${Math.round(avgRate)}`,
          relevance: 'high',
          timestamp: now.toISOString()
        });
      }

      // Remote work opportunities
      const remoteJobs = skillJobs.filter((job: any) => job.remote).length;
      const remotePercentage = skillJobs.length > 0 ? (remoteJobs / skillJobs.length) * 100 : 0;

      insights.push({
        id: `remote-${skill}-${Date.now()}`,
        skill,
        title: `${skill} Remote Opportunities`,
        value: Math.round(remotePercentage),
        change: 1.5,
        changeType: 'increase',
        description: `${Math.round(remotePercentage)}% of ${skill} jobs offer remote work`,
        relevance: 'medium',
        timestamp: now.toISOString()
      });
    }
  });

  // Sort by relevance and recency
  return insights.sort((a, b) => {
    const relevanceOrder = { high: 3, medium: 2, low: 1 };
    return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
  });
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

function calculateAverageRate(jobs: any[]): number {
  const rates = jobs
    .map(job => job.rate)
    .filter(rate => rate && typeof rate === 'number')
    .filter(rate => rate > 10 && rate < 500);

  if (rates.length === 0) return 0;

  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}
