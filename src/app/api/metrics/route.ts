import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get system metrics from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const metrics = await prisma.systemMetric.findMany({
      where: {
        timestamp: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Group metrics by type
    const groupedMetrics = metrics.reduce((acc: Record<string, any[]>, metric: any) => {
      if (!acc[metric.metric]) {
        acc[metric.metric] = [];
      }
      acc[metric.metric].push({
        value: metric.value,
        unit: metric.unit,
        timestamp: metric.timestamp,
        metadata: metric.metadata
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate summary statistics
    const summary = {
      totalMetrics: metrics.length,
      metricsByType: Object.keys(groupedMetrics).map(type => ({
        type,
        count: groupedMetrics[type].length,
        latest: groupedMetrics[type][0],
        average: groupedMetrics[type].reduce((sum: number, m: any) => sum + m.value, 0) / groupedMetrics[type].length
      })),
      timeRange: {
        from: twentyFourHoursAgo.toISOString(),
        to: new Date().toISOString()
      }
    };

    return NextResponse.json({
      summary,
      metrics: groupedMetrics
    });
  } catch (error) {
    console.error('Failed to fetch system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, unit, metadata } = body;

    if (!metric || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Metric name and numeric value are required' },
        { status: 400 }
      );
    }

    const systemMetric = await prisma.systemMetric.create({
      data: {
        metric,
        value,
        unit: unit || null,
        metadata: metadata || null
      }
    });

    return NextResponse.json(systemMetric, { status: 201 });
  } catch (error) {
    console.error('Failed to create system metric:', error);
    return NextResponse.json(
      { error: 'Failed to create system metric' },
      { status: 500 }
    );
  }
}
