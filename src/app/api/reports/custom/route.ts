import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');
const CUSTOM_REPORTS_FILE = path.join(process.cwd(), 'custom-reports.json');

interface CustomReportRequest {
  title: string;
  filters: {
    region?: string;
    industry?: string;
    experience?: string;
    skills?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  visualizations: string[];
  userId: string;
}

interface CustomReport {
  id: string;
  title: string;
  filters: any;
  visualizations: string[];
  data: any;
  generatedAt: string;
  userId: string;
  downloadUrl: string;
}

// Initialize custom reports file if it doesn't exist
if (!fs.existsSync(CUSTOM_REPORTS_FILE)) {
  fs.writeFileSync(CUSTOM_REPORTS_FILE, JSON.stringify([], null, 2));
}

export async function POST(request: Request) {
  try {
    const body: CustomReportRequest = await request.json();
    const { title, filters, visualizations, userId } = body;

    // Load metrics data
    let metrics = { jobs: [], evaluations: [] };
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }

    // Apply filters to data
    const filteredData = applyFilters(metrics.jobs, filters);

    // Generate report data
    const reportData = generateReportData(filteredData, visualizations);

    // Create custom report
    const customReport: CustomReport = {
      id: `custom-report-${Date.now()}`,
      title,
      filters,
      visualizations,
      data: reportData,
      generatedAt: new Date().toISOString(),
      userId,
      downloadUrl: `/api/reports/custom/download/${Date.now()}`
    };

    // Save custom report
    let customReports: CustomReport[] = [];
    if (fs.existsSync(CUSTOM_REPORTS_FILE)) {
      const data = fs.readFileSync(CUSTOM_REPORTS_FILE, 'utf8');
      customReports = JSON.parse(data);
    }

    customReports.push(customReport);
    fs.writeFileSync(CUSTOM_REPORTS_FILE, JSON.stringify(customReports, null, 2));

    return NextResponse.json(customReport);
  } catch (error) {
    console.error('Error generating custom report:', error);
    return NextResponse.json({ error: 'Failed to generate custom report' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let customReports: CustomReport[] = [];
    if (fs.existsSync(CUSTOM_REPORTS_FILE)) {
      const data = fs.readFileSync(CUSTOM_REPORTS_FILE, 'utf8');
      customReports = JSON.parse(data);
    }

    if (userId) {
      customReports = customReports.filter(report => report.userId === userId);
    }

    return NextResponse.json(customReports);
  } catch (error) {
    console.error('Error fetching custom reports:', error);
    return NextResponse.json({ error: 'Failed to fetch custom reports' }, { status: 500 });
  }
}

function applyFilters(jobs: any[], filters: any) {
  let filtered = [...jobs];

  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(job => job.location === filters.region);
  }

  if (filters.industry && filters.industry !== 'all') {
    filtered = filtered.filter(job => job.industry === filters.industry);
  }

  if (filters.experience && filters.experience !== 'all') {
    filtered = filtered.filter(job => job.experience === filters.experience);
  }

  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter(job =>
      filters.skills.some((skill: string) =>
        job.skills?.some((jobSkill: string) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    filtered = filtered.filter(job => {
      const jobDate = new Date(job.createdAt);
      return jobDate >= startDate && jobDate <= endDate;
    });
  }

  return filtered;
}

function generateReportData(jobs: any[], visualizations: string[]) {
  const reportData: any = {
    summary: {
      totalJobs: jobs.length,
      averageRate: jobs.length > 0 ? jobs.reduce((sum, job) => sum + (job.rate || 0), 0) / jobs.length : 0,
      remotePercentage: jobs.length > 0 ? (jobs.filter(job => job.remote).length / jobs.length) * 100 : 0
    }
  };

  visualizations.forEach(viz => {
    switch (viz) {
      case 'industry-demand':
        reportData.industryDemand = generateIndustryDemandData(jobs);
        break;
      case 'salary-analysis':
        reportData.salaryAnalysis = generateSalaryAnalysisData(jobs);
        break;
      case 'skills-demand':
        reportData.skillsDemand = generateSkillsDemandData(jobs);
        break;
      case 'regional-distribution':
        reportData.regionalDistribution = generateRegionalDistributionData(jobs);
        break;
      case 'experience-levels':
        reportData.experienceLevels = generateExperienceLevelsData(jobs);
        break;
    }
  });

  return reportData;
}

function generateIndustryDemandData(jobs: any[]) {
  const industryCount: Record<string, number> = {};
  jobs.forEach(job => {
    const industry = job.industry || 'Other';
    industryCount[industry] = (industryCount[industry] || 0) + 1;
  });

  return {
    labels: Object.keys(industryCount),
    data: Object.values(industryCount),
    type: 'bar'
  };
}

function generateSalaryAnalysisData(jobs: any[]) {
  const salaryRanges = {
    '0-50': 0,
    '51-100': 0,
    '101-150': 0,
    '151+': 0
  };

  jobs.forEach(job => {
    const rate = job.rate || 0;
    if (rate <= 50) salaryRanges['0-50']++;
    else if (rate <= 100) salaryRanges['51-100']++;
    else if (rate <= 150) salaryRanges['101-150']++;
    else salaryRanges['151+']++;
  });

  return {
    labels: Object.keys(salaryRanges),
    data: Object.values(salaryRanges),
    type: 'pie'
  };
}

function generateSkillsDemandData(jobs: any[]) {
  const skillCount: Record<string, number> = {};
  jobs.forEach(job => {
    if (job.skills) {
      job.skills.forEach((skill: string) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    }
  });

  const topSkills = Object.entries(skillCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);

  return {
    labels: topSkills.map(([skill]) => skill),
    data: topSkills.map(([,count]) => count),
    type: 'horizontalBar'
  };
}

function generateRegionalDistributionData(jobs: any[]) {
  const regionCount: Record<string, number> = {};
  jobs.forEach(job => {
    const region = job.remote ? 'Remote' : (job.location || 'Other');
    regionCount[region] = (regionCount[region] || 0) + 1;
  });

  return {
    labels: Object.keys(regionCount),
    data: Object.values(regionCount),
    type: 'doughnut'
  };
}

function generateExperienceLevelsData(jobs: any[]) {
  const experienceCount: Record<string, number> = {
    entry: 0,
    mid: 0,
    senior: 0
  };

  jobs.forEach(job => {
    const exp = job.experience || 'mid';
    experienceCount[exp] = (experienceCount[exp] || 0) + 1;
  });

  return {
    labels: Object.keys(experienceCount).map(exp => exp.charAt(0).toUpperCase() + exp.slice(1)),
    data: Object.values(experienceCount),
    type: 'line'
  };
}
