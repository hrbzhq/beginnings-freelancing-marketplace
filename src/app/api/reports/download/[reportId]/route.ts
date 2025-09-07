import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REPORTS_FILE = path.join(process.cwd(), 'reports.json');
const PURCHASES_FILE = path.join(process.cwd(), 'purchases.json');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify purchase
    let purchases = [];
    if (fs.existsSync(PURCHASES_FILE)) {
      const data = fs.readFileSync(PURCHASES_FILE, 'utf8');
      purchases = JSON.parse(data);
    }

    const purchase = purchases.find((p: any) =>
      p.reportId === reportId &&
      p.userId === userId &&
      p.status === 'completed'
    );

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found or not completed' }, { status: 403 });
    }

    // Get report content
    let reports = [];
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      reports = JSON.parse(data);
    }

    const report = reports.find((r: any) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Return report as downloadable content
    return new NextResponse(report.content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md"`
      }
    });
  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json({ error: 'Failed to download report' }, { status: 500 });
  }
}
