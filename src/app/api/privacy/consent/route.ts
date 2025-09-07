import { NextRequest, NextResponse } from 'next/server';
import {
  recordUserConsent,
  hasUserConsent,
  getPrivacyPolicy,
  validatePrivacyAcceptance
} from '@/lib/compliance/privacy';

/**
 * GET /api/privacy/consent
 * Check user's consent status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const consentType = searchParams.get('type') as any;

    if (!userId || !consentType) {
      return NextResponse.json(
        { error: 'User ID and consent type are required' },
        { status: 400 }
      );
    }

    const hasConsent = hasUserConsent(userId, consentType);

    return NextResponse.json({ hasConsent });
  } catch (error) {
    console.error('Error checking consent:', error);
    return NextResponse.json(
      { error: 'Failed to check consent' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/privacy/consent
 * Record user consent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, consentType, consented, consentVersion, ipAddress, userAgent } = body;

    if (!userId || !consentType) {
      return NextResponse.json(
        { error: 'User ID and consent type are required' },
        { status: 400 }
      );
    }

    const consent = recordUserConsent({
      userId,
      consentType,
      consented,
      consentVersion: consentVersion || '1.1',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      message: 'Consent recorded successfully',
      consent
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}
