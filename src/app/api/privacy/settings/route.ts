import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPrivacySettings,
  updatePrivacySettings,
  requestDataExport,
  requestAccountDeletion,
  getPrivacyPolicy,
  validatePrivacyAcceptance,
  recordUserConsent,
  hasUserConsent
} from '@/lib/compliance/privacy';

/**
 * GET /api/privacy/settings
 * Get user's privacy settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const settings = getUserPrivacySettings(userId);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/privacy/settings
 * Update user's privacy settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedSettings = updatePrivacySettings(userId, settings);

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}
