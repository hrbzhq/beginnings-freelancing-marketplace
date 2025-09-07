import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown',
      stripe: 'unknown',
    },
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.services.database = 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    healthcheck.services.database = 'unhealthy';
    healthcheck.status = 'degraded';
  }

  try {
    // Check Redis connection
    await redis.ping();
    healthcheck.services.redis = 'healthy';
  } catch (error) {
    console.error('Redis health check failed:', error);
    healthcheck.services.redis = 'unhealthy';
    healthcheck.status = 'degraded';
  }

  try {
    // Check Stripe configuration
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLIC_KEY) {
      healthcheck.services.stripe = 'configured';
    } else {
      healthcheck.services.stripe = 'not_configured';
      healthcheck.status = 'degraded';
    }
  } catch (error) {
    healthcheck.services.stripe = 'error';
    healthcheck.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = healthcheck.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthcheck, { status: statusCode });
}
