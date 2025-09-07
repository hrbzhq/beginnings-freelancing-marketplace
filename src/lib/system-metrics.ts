import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function systemMetricsMiddleware(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Record request start
    const response = await NextResponse.next();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Record API latency metric
    await prisma.systemMetric.create({
      data: {
        metric: 'api_latency',
        value: duration,
        unit: 'ms',
        metadata: {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('user-agent'),
          statusCode: response.status
        }
      }
    });

    // Record error count if status is 5xx
    if (response.status >= 500) {
      await prisma.systemMetric.create({
        data: {
          metric: 'api_error',
          value: 1,
          unit: 'count',
          metadata: {
            method: request.method,
            url: request.url,
            statusCode: response.status,
            error: '5xx server error'
          }
        }
      });
    }

    return response;
  } catch (error) {
    // Record system error
    await prisma.systemMetric.create({
      data: {
        metric: 'system_error',
        value: 1,
        unit: 'count',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: request.url,
          method: request.method
        }
      }
    });

    throw error;
  }
}

// Function to record custom metrics
export async function recordMetric(
  metric: string,
  value: number,
  unit?: string,
  metadata?: any
) {
  try {
    await prisma.systemMetric.create({
      data: {
        metric,
        value,
        unit: unit || null,
        metadata: metadata || null
      }
    });
  } catch (error) {
    console.error('Failed to record metric:', error);
  }
}

// Function to get system health status
export async function getSystemHealth() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get recent metrics
    const recentMetrics = await prisma.systemMetric.findMany({
      where: {
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    // Calculate health scores
    const errorCount = recentMetrics.filter((m: any) => m.metric === 'api_error').length;
    const avgLatency = recentMetrics
      .filter((m: any) => m.metric === 'api_latency')
      .reduce((sum: number, m: any) => sum + m.value, 0) / recentMetrics.filter((m: any) => m.metric === 'api_latency').length;

    const health = {
      status: errorCount > 10 ? 'critical' : errorCount > 5 ? 'warning' : 'healthy',
      metrics: {
        totalRequests: recentMetrics.filter((m: any) => m.metric === 'api_latency').length,
        errorCount,
        averageLatency: avgLatency || 0,
        errorRate: errorCount / Math.max(recentMetrics.filter((m: any) => m.metric === 'api_latency').length, 1)
      },
      timestamp: new Date().toISOString()
    };

    return health;
  } catch (error) {
    console.error('Failed to get system health:', error);
    return {
      status: 'unknown',
      error: 'Failed to retrieve health data',
      timestamp: new Date().toISOString()
    };
  }
}
