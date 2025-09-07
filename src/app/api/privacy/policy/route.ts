import { NextRequest, NextResponse } from 'next/server';
import { getPrivacyPolicy, CURRENT_PRIVACY_VERSION } from '@/lib/compliance/privacy';

/**
 * GET /api/privacy/policy
 * Get privacy policy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');

    const policy = getPrivacyPolicy(version || undefined);

    return NextResponse.json({
      policy,
      version: version || CURRENT_PRIVACY_VERSION,
      currentVersion: CURRENT_PRIVACY_VERSION
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy policy' },
      { status: 500 }
    );
  }
}
