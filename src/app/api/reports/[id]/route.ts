import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    const userId = searchParams.get('userId'); // For demo purposes
    const { id } = await params;
    let hasFullAccess = false;
    if (userId) {
      const user = await prisma.user.findFirst({
        where: { id: userId },
        include: {
          subscriptions: {
            where: {
              status: 'active',
              endDate: {
                gte: new Date()
              }
            }
          }
        }
      });

      hasFullAccess = (user?.subscriptions?.length ?? 0) > 0;
    }

    // Mock report data - in production, this would come from database
    const reportData = {
      id: id,
      title: 'React Developer Market Analysis 2025',
      summary: 'Comprehensive analysis of React developer demand, salary trends, and market opportunities in 2025.',
      category: 'Technology',
      price: 49,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      charts: [
        {
          id: 'salary-trends',
          title: 'Average Salary Trends',
          type: 'line',
          data: [
            { month: 'Jan', salary: 85000 },
            { month: 'Feb', salary: 87000 },
            { month: 'Mar', salary: 89000 },
            { month: 'Apr', salary: 92000 },
            { month: 'May', salary: 95000 },
            { month: 'Jun', salary: 98000 }
          ]
        },
        {
          id: 'demand-growth',
          title: 'Job Demand Growth',
          type: 'bar',
          data: [
            { skill: 'React', growth: 25 },
            { skill: 'TypeScript', growth: 30 },
            { skill: 'Next.js', growth: 35 },
            { skill: 'Node.js', growth: 20 },
            { skill: 'GraphQL', growth: 40 }
          ]
        },
        {
          id: 'location-distribution',
          title: 'Job Distribution by Location',
          type: 'pie',
          data: [
            { location: 'San Francisco', percentage: 25 },
            { location: 'New York', percentage: 20 },
            { location: 'London', percentage: 15 },
            { location: 'Berlin', percentage: 12 },
            { location: 'Toronto', percentage: 10 },
            { location: 'Other', percentage: 18 }
          ]
        },
        {
          id: 'experience-levels',
          title: 'Salary by Experience Level',
          type: 'bar',
          data: [
            { level: 'Entry', salary: 65000 },
            { level: 'Mid', salary: 85000 },
            { level: 'Senior', salary: 120000 },
            { level: 'Lead', salary: 150000 }
          ]
        },
        {
          id: 'company-size',
          title: 'Opportunities by Company Size',
          type: 'pie',
          data: [
            { size: 'Startup', percentage: 40 },
            { size: 'Mid-size', percentage: 35 },
            { size: 'Enterprise', percentage: 25 }
          ]
        }
      ],
      fullContent: hasFullAccess ? `
        # Complete React Developer Market Analysis 2025

        ## Executive Summary
        The React developer market continues to show strong growth with increasing demand across all experience levels...

        ## Detailed Analysis
        ### Salary Trends
        Average salaries have increased by 15% year-over-year...

        ### Demand Analysis
        Job postings for React developers have grown by 25%...

        ### Geographic Distribution
        San Francisco remains the top market with 25% of opportunities...

        ## Recommendations
        1. Focus on TypeScript proficiency
        2. Consider Next.js specialization
        3. Target mid-size companies for best work-life balance
      ` : null,
      isPreview: !hasFullAccess || preview
    };

    // Log analytics if user is provided
    if (userId) {
      await prisma.analyticsEvent.create({
        data: {
          userId: userId,
          type: 'report_view',
          metadata: {
            reportId: id,
            isPreview: reportData.isPreview,
            hasFullAccess
          }
        }
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
