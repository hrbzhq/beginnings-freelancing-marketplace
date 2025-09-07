/**
 * Compliance & Security Module
 * Handles data source compliance, privacy, and security measures
 */

export interface DataSourceCompliance {
  platform: string;
  termsOfServiceUrl: string;
  robotsTxtUrl: string;
  scrapingAllowed: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  userAgent: string;
  lastComplianceCheck: Date;
  complianceNotes: string[];
}

export interface ComplianceChecklist {
  dataSource: string;
  termsOfServiceReviewed: boolean;
  robotsTxtRespected: boolean;
  rateLimitsImplemented: boolean;
  userAgentSet: boolean;
  dataUsagePermitted: boolean;
  attributionRequired: boolean;
  lastUpdated: Date;
  reviewer: string;
}

/**
 * Compliance checklist for data sources
 */
export const COMPLIANCE_CHECKLIST: ComplianceChecklist[] = [
  {
    dataSource: 'Upwork',
    termsOfServiceReviewed: false,
    robotsTxtRespected: false,
    rateLimitsImplemented: false,
    userAgentSet: false,
    dataUsagePermitted: false,
    attributionRequired: true,
    lastUpdated: new Date(),
    reviewer: 'System'
  },
  {
    dataSource: 'Fiverr',
    termsOfServiceReviewed: false,
    robotsTxtRespected: false,
    rateLimitsImplemented: false,
    userAgentSet: false,
    dataUsagePermitted: false,
    attributionRequired: true,
    lastUpdated: new Date(),
    reviewer: 'System'
  }
];

/**
 * Data source compliance configuration
 */
export const DATA_SOURCE_COMPLIANCE: DataSourceCompliance[] = [
  {
    platform: 'Upwork',
    termsOfServiceUrl: 'https://www.upwork.com/legal/terms',
    robotsTxtUrl: 'https://www.upwork.com/robots.txt',
    scrapingAllowed: false, // Upwork generally prohibits scraping
    rateLimits: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 500
    },
    userAgent: 'beginnings-freelance-marketplace/1.0 (+https://beginnings.dev)',
    lastComplianceCheck: new Date(),
    complianceNotes: [
      'Upwork Terms of Service prohibit automated scraping',
      'Consider using official Upwork API instead',
      'High risk of IP blocking and legal action'
    ]
  },
  {
    platform: 'Fiverr',
    termsOfServiceUrl: 'https://www.fiverr.com/terms_of_service',
    robotsTxtUrl: 'https://www.fiverr.com/robots.txt',
    scrapingAllowed: false, // Fiverr also prohibits scraping
    rateLimits: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 500
    },
    userAgent: 'beginnings-freelance-marketplace/1.0 (+https://beginnings.dev)',
    lastComplianceCheck: new Date(),
    complianceNotes: [
      'Fiverr Terms prohibit automated data collection',
      'Consider using official Fiverr API',
      'Risk of account suspension and legal issues'
    ]
  }
];

/**
 * Check compliance status for a data source
 */
export function checkCompliance(dataSource: string): ComplianceChecklist | null {
  return COMPLIANCE_CHECKLIST.find(item =>
    item.dataSource.toLowerCase() === dataSource.toLowerCase()
  ) || null;
}

/**
 * Update compliance checklist
 */
export function updateCompliance(
  dataSource: string,
  updates: Partial<ComplianceChecklist>
): void {
  const index = COMPLIANCE_CHECKLIST.findIndex(item =>
    item.dataSource.toLowerCase() === dataSource.toLowerCase()
  );

  if (index !== -1) {
    COMPLIANCE_CHECKLIST[index] = {
      ...COMPLIANCE_CHECKLIST[index],
      ...updates,
      lastUpdated: new Date()
    };
  }
}

/**
 * Get compliance configuration for a platform
 */
export function getComplianceConfig(platform: string): DataSourceCompliance | null {
  return DATA_SOURCE_COMPLIANCE.find(item =>
    item.platform.toLowerCase() === platform.toLowerCase()
  ) || null;
}

/**
 * Validate scraping request against compliance rules
 */
export function validateScrapingRequest(platform: string): {
  allowed: boolean;
  reason?: string;
  recommendations?: string[];
} {
  const config = getComplianceConfig(platform);
  const checklist = checkCompliance(platform);

  if (!config) {
    return {
      allowed: false,
      reason: 'Platform not found in compliance database',
      recommendations: ['Add platform to compliance checklist']
    };
  }

  if (!config.scrapingAllowed) {
    return {
      allowed: false,
      reason: `${platform} prohibits automated scraping per their Terms of Service`,
      recommendations: [
        'Use official API if available',
        'Contact platform for data partnership',
        'Consider alternative data sources'
      ]
    };
  }

  if (!checklist?.termsOfServiceReviewed) {
    return {
      allowed: false,
      reason: 'Terms of Service not reviewed',
      recommendations: ['Review platform terms before scraping']
    };
  }

  return { allowed: true };
}
