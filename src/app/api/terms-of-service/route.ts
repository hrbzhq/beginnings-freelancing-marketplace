import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const termsOfService = {
    version: '1.0',
    lastUpdated: '2025-09-07',
    content: {
      introduction: 'Welcome to Beginnings, a freelancing marketplace powered by AI insights.',
      dataCollection: {
        personalData: 'We collect email, name, and skill preferences for personalized insights.',
        usageData: 'We track job searches, report views, and subscription usage for analytics.',
        paymentData: 'Payment information is processed securely through Stripe and not stored on our servers.'
      },
      dataUsage: {
        personalization: 'Data is used to provide personalized job recommendations and market insights.',
        analytics: 'Aggregated data helps improve our AI models and platform features.',
        communication: 'We may send relevant updates about your skills and market trends.'
      },
      dataSharing: {
        thirdPartyServices: 'We use Ollama for AI analysis and Stripe for payments.',
        noSale: 'We do not sell personal data to third parties.',
        legalCompliance: 'Data may be shared when required by law or to protect platform integrity.'
      },
      userRights: {
        access: 'Users can access their data through the Privacy Center.',
        export: 'Data export functionality available in account settings.',
        deletion: 'Account deletion removes all personal data from our systems.',
        optOut: 'Users can opt out of marketing communications at any time.'
      },
      dataRetention: {
        activeAccounts: 'Data retained while account is active.',
        inactiveAccounts: 'Inactive accounts deleted after 2 years.',
        legalHold: 'Data may be retained longer for legal compliance.'
      },
      security: {
        encryption: 'All data encrypted in transit and at rest.',
        accessControl: 'Strict access controls and regular security audits.',
        incidentResponse: '24/7 monitoring with rapid incident response.'
      },
      contact: {
        email: 'privacy@beginnings.ai',
        responseTime: 'We respond to privacy inquiries within 30 days.'
      }
    }
  };

  return NextResponse.json(termsOfService);
}
