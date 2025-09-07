/**
 * API Protection & Security Module
 * Implements rate limiting, circuit breakers, and security measures
 */

export interface RateLimit {
  identifier: string; // IP address, user ID, or API key
  endpoint: string;
  requests: number;
  windowStart: Date;
  windowSize: number; // in milliseconds
}

export interface CircuitBreaker {
  service: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime: Date;
  nextAttemptTime: Date;
  successThreshold: number;
  timeout: number;
}

export interface SecurityEvent {
  id: string;
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'brute_force_attempt' | 'sql_injection_attempt';
  identifier: string;
  endpoint: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  // General API limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5
  },

  // Job scraping endpoints
  scraping: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10
  },

  // AI analysis endpoints
  ai: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 50
  }
};

/**
 * Circuit breaker configuration
 */
export const CIRCUIT_BREAKERS = {
  ollama: {
    failureThreshold: 5,
    recoveryTimeout: 60 * 1000, // 1 minute
    successThreshold: 3
  },

  database: {
    failureThreshold: 3,
    recoveryTimeout: 30 * 1000, // 30 seconds
    successThreshold: 2
  },

  scraping: {
    failureThreshold: 10,
    recoveryTimeout: 5 * 60 * 1000, // 5 minutes
    successThreshold: 5
  }
};

// In-memory storage for rate limits and circuit breakers
const rateLimitStore = new Map<string, RateLimit>();
const circuitBreakerStore = new Map<string, CircuitBreaker>();
const securityEvents: SecurityEvent[] = [];

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS = 'general'
): { allowed: boolean; remaining: number; resetTime: Date } {
  const limit = RATE_LIMITS[limitType];
  const key = `${identifier}:${endpoint}:${limitType}`;

  const now = new Date();
  const windowStart = new Date(now.getTime() - limit.windowMs);

  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.windowStart < windowStart) {
      rateLimitStore.delete(k);
    }
  }

  let rateLimit = rateLimitStore.get(key);

  if (!rateLimit || rateLimit.windowStart < windowStart) {
    // Create new rate limit window
    rateLimit = {
      identifier,
      endpoint,
      requests: 0,
      windowStart: now,
      windowSize: limit.windowMs
    };
    rateLimitStore.set(key, rateLimit);
  }

  const remaining = Math.max(0, limit.maxRequests - rateLimit.requests);
  const allowed = rateLimit.requests < limit.maxRequests;

  if (allowed) {
    rateLimit.requests++;
  } else {
    // Log rate limit violation
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      identifier,
      endpoint,
      severity: 'medium',
      details: { limitType, maxRequests: limit.maxRequests }
    });
  }

  const resetTime = new Date(rateLimit.windowStart.getTime() + limit.windowMs);

  return { allowed, remaining, resetTime };
}

/**
 * Check circuit breaker state
 */
export function checkCircuitBreaker(service: string): { allowed: boolean; state: string } {
  const config = CIRCUIT_BREAKERS[service as keyof typeof CIRCUIT_BREAKERS];
  if (!config) {
    return { allowed: true, state: 'closed' };
  }

  let breaker = circuitBreakerStore.get(service);

  if (!breaker) {
    breaker = {
      service,
      state: 'closed',
      failures: 0,
      lastFailureTime: new Date(0),
      nextAttemptTime: new Date(0),
      successThreshold: config.successThreshold,
      timeout: config.recoveryTimeout
    };
    circuitBreakerStore.set(service, breaker);
  }

  const now = new Date();

  // Check if we should attempt recovery
  if (breaker.state === 'open' && now >= breaker.nextAttemptTime) {
    breaker.state = 'half-open';
  }

  const allowed = breaker.state !== 'open';

  return { allowed, state: breaker.state };
}

/**
 * Record circuit breaker failure
 */
export function recordCircuitBreakerFailure(service: string): void {
  const breaker = circuitBreakerStore.get(service);
  if (!breaker) return;

  breaker.failures++;
  breaker.lastFailureTime = new Date();

  if (breaker.failures >= CIRCUIT_BREAKERS[service as keyof typeof CIRCUIT_BREAKERS].failureThreshold) {
    breaker.state = 'open';
    breaker.nextAttemptTime = new Date(Date.now() + breaker.timeout);
  }

  circuitBreakerStore.set(service, breaker);
}

/**
 * Record circuit breaker success
 */
export function recordCircuitBreakerSuccess(service: string): void {
  const breaker = circuitBreakerStore.get(service);
  if (!breaker) return;

  if (breaker.state === 'half-open') {
    breaker.failures = 0;
    breaker.state = 'closed';
  }

  circuitBreakerStore.set(service, breaker);
}

/**
 * Log security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
  const securityEvent: SecurityEvent = {
    ...event,
    id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };

  securityEvents.push(securityEvent);

  // In a real implementation, this would be sent to a security monitoring system
  console.log('Security Event:', securityEvent);

  // Keep only last 1000 events
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }
}

/**
 * Get recent security events
 */
export function getSecurityEvents(limit: number = 100): SecurityEvent[] {
  return securityEvents.slice(-limit);
}

/**
 * Basic input sanitization
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): boolean {
  // Basic validation - should be improved for production
  return /^[a-zA-Z0-9]{32,}$/.test(apiKey);
}

/**
 * Generate rate limit headers for response
 */
export function getRateLimitHeaders(
  identifier: string,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS = 'general'
): Record<string, string> {
  const { remaining, resetTime } = checkRateLimit(identifier, endpoint, limitType);

  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetTime.getTime() / 1000).toString(),
    'X-RateLimit-Limit': RATE_LIMITS[limitType].maxRequests.toString()
  };
}
