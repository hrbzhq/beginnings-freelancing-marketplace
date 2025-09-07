import { NextRequest, NextResponse } from 'next/server';
import {
  requestDataExport,
  requestAccountDeletion,
  getDataExportUrl
} from '@/lib/compliance/privacy';

/**
 * POST /api/privacy/data-request
 * Request data export or account deletion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, requestType } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!['export', 'delete'].includes(requestType)) {
      return NextResponse.json(
        { error: 'Invalid request type. Must be "export" or "delete"' },
        { status: 400 }
      );
    }

    let dataRequest;

    if (requestType === 'export') {
      dataRequest = requestDataExport(userId);
    } else {
      dataRequest = requestAccountDeletion(userId);
    }

    return NextResponse.json({
      message: `${requestType === 'export' ? 'Data export' : 'Account deletion'} request submitted`,
      request: dataRequest
    });
  } catch (error) {
    console.error('Error processing data request:', error);
    return NextResponse.json(
      { error: 'Failed to process data request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/privacy/data-request
 * Get data export URL or request status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const downloadUrl = getDataExportUrl(requestId);

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Export not ready or request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Error fetching data export:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data export' },
      { status: 500 }
    );
  }
}
