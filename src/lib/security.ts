import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.headers.get('x-client-ip') ||
             'unknown';
  const now = Date.now();

  // Get or create rate limit entry
  let rateLimitEntry = rateLimitStore.get(ip);

  if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
    // Reset or create new entry
    rateLimitEntry = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    };
  }

  // Increment request count
  rateLimitEntry.count++;

  // Update store
  rateLimitStore.set(ip, rateLimitEntry);

  // Check if rate limit exceeded
  if (rateLimitEntry.count > RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitEntry.resetTime - now) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitEntry.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateLimitEntry.count).toString(),
          'X-RateLimit-Reset': rateLimitEntry.resetTime.toString()
        }
      }
    );
  }

  // Add rate limit headers to successful requests
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT_MAX_REQUESTS - rateLimitEntry.count).toString());
  response.headers.set('X-RateLimit-Reset', rateLimitEntry.resetTime.toString());

  return response;
}

// Security headers middleware
export function securityHeadersMiddleware(response: NextResponse) {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// Input validation middleware
export function validateInputMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /javascript:/i,  // JavaScript injection
    /on\w+\s*=/i,  // Event handler injection
    /union\s+select/i,  // SQL injection
    /--/,  // SQL comment
    /\/\*.*\*\//,  // SQL comment block
  ];

  // Check query parameters
  for (const [key, value] of url.searchParams) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return NextResponse.json(
          { error: 'Invalid input detected' },
          { status: 400 }
        );
      }
    }
  }

  // Check request body for POST/PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = request.body;
      if (body) {
        const bodyText = JSON.stringify(body);
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(bodyText)) {
            return NextResponse.json(
              { error: 'Invalid input detected' },
              { status: 400 }
            );
          }
        }
      }
    } catch (error) {
      // If body parsing fails, continue (might be form data)
    }
  }

  return null; // No validation errors
}
