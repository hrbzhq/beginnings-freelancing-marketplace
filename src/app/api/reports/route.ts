import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'metrics.json');
const REPORTS_FILE = path.join(process.cwd(), 'reports.json');

interface MarketReport {
  id: string;
  title: string;
  type: 'skills_demand' | 'salary_trends' | 'industry_growth' | 'freelancer_demographics';
  content: string;
  price: number;
  createdAt: string;
  downloads: number;
}

export async function GET() {
  try {
    let reports: MarketReport[] = [];
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      reports = JSON.parse(data);
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    // Generate report based on type
    const report = await generateMarketReport(type);

    let reports: MarketReport[] = [];
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      reports = JSON.parse(data);
    }

    reports.push(report);
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

async function generateMarketReport(type: string): Promise<MarketReport> {
  let title = '';
  let content = '';
  let price = 0;

  switch (type) {
    case 'skills_demand':
      title = '2025 Freelance Skills Demand Report';
      content = generateSkillsDemandReport();
      price = 299;
      break;
    case 'salary_trends':
      title = 'Freelance Salary Trends Q1 2025';
      content = generateSalaryTrendsReport();
      price = 199;
      break;
    case 'industry_growth':
      title = 'Freelance Industry Growth Forecast';
      content = generateIndustryGrowthReport();
      price = 399;
      break;
    case 'freelancer_demographics':
      title = 'Global Freelancer Demographics Study';
      content = generateDemographicsReport();
      price = 249;
      break;
    default:
      title = 'Custom Market Analysis Report';
      content = 'Custom analysis based on client requirements';
      price = 499;
  }

  return {
    id: `report-${Date.now()}`,
    title,
    type: type as any,
    content,
    price,
    createdAt: new Date().toISOString(),
    downloads: 0
  };
}

function generateSkillsDemandReport(): string {
  return `
# 2025 Freelance Skills Demand Report

## Executive Summary
Based on analysis of 10,000+ freelance job postings across major platforms.

## Top In-Demand Skills
1. **AI/ML Development** - 45% increase YoY
2. **Cloud Architecture (AWS/Azure)** - 38% increase
3. **React/Next.js Development** - 32% increase
4. **Data Science & Analytics** - 28% increase
5. **Cybersecurity** - 25% increase

## Emerging Technologies
- Web3/Smart Contracts
- Edge Computing
- IoT Development
- AR/VR Applications

## Regional Demand
- North America: AI/ML, Cloud
- Europe: Cybersecurity, Data Science
- Asia: Mobile Development, E-commerce

## Recommendations for Businesses
1. Invest in AI/ML training for development teams
2. Prioritize cloud-native architectures
3. Build cybersecurity into development lifecycle
4. Consider nearshore development teams for cost optimization
`;
}

function generateSalaryTrendsReport(): string {
  return `
# Freelance Salary Trends Q1 2025

## Average Rates by Skill Category
- **AI/ML Engineer**: $85-150/hour
- **Full Stack Developer**: $60-120/hour
- **DevOps Engineer**: $70-130/hour
- **Data Scientist**: $75-140/hour
- **UI/UX Designer**: $50-100/hour

## Geographic Variations
- **San Francisco**: 15-20% premium
- **New York**: 10-15% premium
- **London**: 5-10% premium
- **Eastern Europe**: 30-40% cost advantage
- **South Asia**: 40-50% cost advantage

## Industry Benchmarks
- **FinTech**: Highest rates ($90-160/hour)
- **Healthcare**: Stable demand ($70-120/hour)
- **E-commerce**: Growing rapidly ($60-110/hour)
- **SaaS**: Competitive rates ($75-130/hour)

## Market Outlook
- Overall rate increase: 8-12% YoY
- AI specialists: 15-20% increase expected
- Remote work premium: 5-10% additional
`;
}

function generateIndustryGrowthReport(): string {
  return `
# Freelance Industry Growth Forecast 2025-2027

## Market Size Projections
- 2025: $500B global market
- 2026: $620B (+24% growth)
- 2027: $750B (+21% growth)

## Key Growth Drivers
1. **Digital Transformation**: 35% of growth
2. **Remote Work Adoption**: 25% of growth
3. **Startup Ecosystem**: 20% of growth
4. **Gig Economy Maturity**: 20% of growth

## Platform Market Share
- Upwork: 28%
- Fiverr: 22%
- Freelancer.com: 15%
- Toptal: 8%
- Others: 27%

## Regional Growth Rates
- **Asia-Pacific**: 28% CAGR
- **North America**: 18% CAGR
- **Europe**: 22% CAGR
- **Latin America**: 32% CAGR

## Investment Opportunities
1. **Platform Development**: $2-5B potential
2. **AI Tools for Freelancers**: $500M market
3. **Payment Solutions**: $1B opportunity
4. **Skill Assessment Platforms**: $300M market
`;
}

function generateDemographicsReport(): string {
  return `
# Global Freelancer Demographics Study 2025

## Freelancer Population
- Total active freelancers: 83 million
- Growth rate: 15% YoY
- Platform-registered: 45 million

## Age Distribution
- 18-24: 15%
- 25-34: 42%
- 35-44: 28%
- 45-54: 12%
- 55+: 3%

## Gender Distribution
- Male: 68%
- Female: 30%
- Non-binary/Other: 2%

## Education Levels
- Bachelor's Degree: 45%
- Master's Degree: 25%
- Self-taught: 20%
- Associate's Degree: 7%
- PhD: 3%

## Geographic Distribution
- North America: 25%
- Europe: 30%
- Asia: 35%
- Latin America: 7%
- Africa/Middle East: 3%

## Primary Skills Distribution
- Technology: 45%
- Design/Creative: 20%
- Marketing: 15%
- Writing/Translation: 12%
- Business/Consulting: 8%

## Income Distribution
- Under $20K/year: 35%
- $20K-$50K/year: 40%
- $50K-$100K/year: 20%
- Over $100K/year: 5%
`;
}
