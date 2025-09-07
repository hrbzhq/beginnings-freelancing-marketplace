import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');

interface Job {
  id: string;
  title: string;
  description: string;
  employer: string;
  budget: number;
  skills: string[];
  ratings: {
    difficulty: number;
    prospects: number;
    fun: number;
  };
}

interface UserProfile {
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredBudget?: number;
  interests?: string[];
}

export async function POST(request: Request) {
  try {
    const { userProfile }: { userProfile: UserProfile } = await request.json();

    // Get current jobs (in a real app, this would come from a database)
    const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs`);
    const jobs: Job[] = await jobsResponse.json();

    // Get market insights
    let metrics = { jobs: [], evaluations: [] };
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    const recommendations = generateRecommendations(jobs, userProfile, metrics);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

function generateRecommendations(jobs: Job[], userProfile: UserProfile, metrics: any): Job[] {
  const { skills, experienceLevel, preferredBudget, interests } = userProfile;

  // Calculate skill match scores
  const scoredJobs = jobs.map(job => {
    let score = 0;
    let reasons = [];

    // Skill matching (40% weight)
    const skillMatch = job.skills.filter(skill => skills.includes(skill)).length;
    const skillScore = (skillMatch / Math.max(job.skills.length, 1)) * 40;
    score += skillScore;
    if (skillMatch > 0) {
      reasons.push(`${skillMatch} matching skills`);
    }

    // Budget preference (20% weight)
    if (preferredBudget) {
      const budgetDiff = Math.abs(job.budget - preferredBudget) / preferredBudget;
      const budgetScore = Math.max(0, 20 * (1 - budgetDiff));
      score += budgetScore;
      if (budgetDiff < 0.2) {
        reasons.push('Budget matches preference');
      }
    }

    // Experience level compatibility (20% weight)
    let experienceScore = 0;
    if (experienceLevel === 'beginner' && job.ratings.difficulty <= 6) {
      experienceScore = 20;
      reasons.push('Suitable for beginners');
    } else if (experienceLevel === 'intermediate' && job.ratings.difficulty <= 8) {
      experienceScore = 20;
      reasons.push('Good intermediate challenge');
    } else if (experienceLevel === 'expert') {
      experienceScore = 20;
      reasons.push('Expert-level opportunity');
    }
    score += experienceScore;

    // Market demand (20% weight)
    const demandScore = job.ratings.prospects * 2;
    score += demandScore;
    if (job.ratings.prospects > 7) {
      reasons.push('High market demand');
    }

    return {
      ...job,
      recommendationScore: Math.round(score),
      recommendationReasons: reasons
    };
  });

  // Sort by score and return top recommendations
  return scoredJobs
    .sort((a, b) => (b as any).recommendationScore - (a as any).recommendationScore)
    .slice(0, 5);
}
