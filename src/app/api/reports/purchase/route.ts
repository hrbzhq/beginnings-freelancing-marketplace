import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REPORTS_FILE = path.join(process.cwd(), 'reports.json');
const PURCHASES_FILE = path.join(process.cwd(), 'purchases.json');

interface Purchase {
  id: string;
  reportId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportId, userId } = body;

    // Load reports
    let reports = [];
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      reports = JSON.parse(data);
    }

    const report = reports.find((r: any) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Create purchase record
    const purchase: Purchase = {
      id: `purchase-${Date.now()}`,
      reportId,
      userId,
      amount: report.price,
      status: 'completed', // Simplified - in production, integrate with payment processor
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/reports/download/${reportId}`
    };

    // Load existing purchases
    let purchases: Purchase[] = [];
    if (fs.existsSync(PURCHASES_FILE)) {
      const data = fs.readFileSync(PURCHASES_FILE, 'utf8');
      purchases = JSON.parse(data);
    }

    purchases.push(purchase);
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));

    // Update report download count
    report.downloads = (report.downloads || 0) + 1;
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Report purchased successfully'
    });
  } catch (error) {
    console.error('Error purchasing report:', error);
    return NextResponse.json({ error: 'Failed to purchase report' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let purchases: Purchase[] = [];
    if (fs.existsSync(PURCHASES_FILE)) {
      const data = fs.readFileSync(PURCHASES_FILE, 'utf8');
      purchases = JSON.parse(data);
    }

    const userPurchases = purchases.filter((p: Purchase) => p.userId === userId);

    return NextResponse.json(userPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}
