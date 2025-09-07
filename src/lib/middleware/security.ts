import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  checkCircuitBreaker,
  logSecurityEvent,
  sanitizeInput,
  getRateLimitHeaders
} from '@/lib/compliance/security';

export function securityMiddleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Get client identifier (IP address)
  const clientIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Skip security checks for static files and health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/health') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Rate limiting
  let limitType: 'general' | 'auth' | 'scraping' | 'ai' = 'general';

  if (pathname.startsWith('/api/auth')) {
    limitType = 'auth';
  } else if (pathname.startsWith('/api/scrape')) {
    limitType = 'scraping';
  } else if (pathname.startsWith('/api/evaluate') || pathname.startsWith('/api/analyze')) {
    limitType = 'ai';
  }

  const rateLimitResult = checkRateLimit(clientIP, pathname, limitType);

  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.floor((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
      },
      { status: 429 }
    );

    // Add rate limit headers
    const headers = getRateLimitHeaders(clientIP, pathname, limitType);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Circuit breaker for external services
  if (pathname.includes('/api/scrape')) {
    const circuitResult = checkCircuitBreaker('scraping');
    if (!circuitResult.allowed) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
  }

  // Input sanitization for query parameters
  const url = new URL(request.url);
  for (const [key, value] of url.searchParams.entries()) {
    const sanitized = sanitizeInput(value);
    if (sanitized !== value) {
      // Log potential security issue
      logSecurityEvent({
        type: 'suspicious_activity',
        identifier: clientIP,
        endpoint: pathname,
        severity: 'medium',
        details: { parameter: key, originalValue: value }
      });
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add rate limit headers
  const headers = getRateLimitHeaders(clientIP, pathname, limitType);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
