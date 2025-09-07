import { NextResponse } from 'next/server';
// import { scrapeUpworkJobs, scrapeFiverrJobs } from '@/lib/scraping';
import { analyzeJobWithLLM } from '@/lib/ollama';

export async function GET() {
  try {
    // TODO: Integrate with new queue system for scraping
    // const { scrapeUpworkJobs, scrapeFiverrJobs } = await import('@/lib/scraping');

    // For now, return sample data from database
    const { prisma } = await import('@/lib/db');

    const jobs = await prisma.job.findMany({
      take: 10,
      include: {
        employer: true,
        jobSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Transform to match existing API format
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      employer: job.employer.name,
      budget: job.budget,
      skills: job.jobSkills.map(js => js.skill.name),
      ratings: job.ratings,
      employerRatings: job.employerRatings
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
