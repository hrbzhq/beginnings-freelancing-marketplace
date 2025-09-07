import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMMISSIONS_FILE = path.join(process.cwd(), 'commissions.json');

interface Commission {
  id: string;
  jobId: string;
  freelancerId: string;
  employerId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  platformFee: number;
}

export async function GET() {
  try {
    let commissions: Commission[] = [];
    if (fs.existsSync(COMMISSIONS_FILE)) {
      const data = fs.readFileSync(COMMISSIONS_FILE, 'utf8');
      commissions = JSON.parse(data);
    }

    const stats = {
      total: commissions.length,
      pending: commissions.filter(c => c.status === 'pending').length,
      paid: commissions.filter(c => c.status === 'paid').length,
      totalRevenue: commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.platformFee, 0)
    };

    return NextResponse.json({ commissions, stats });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jobAmount = body.amount || 0;
    const platformFee = jobAmount * 0.1; // 10% commission

    const newCommission: Commission = {
      id: `com-${Date.now()}`,
      jobId: body.jobId,
      freelancerId: body.freelancerId,
      employerId: body.employerId,
      amount: jobAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      platformFee
    };

    let commissions: Commission[] = [];
    if (fs.existsSync(COMMISSIONS_FILE)) {
      const data = fs.readFileSync(COMMISSIONS_FILE, 'utf8');
      commissions = JSON.parse(data);
    }

    commissions.push(newCommission);
    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(commissions, null, 2));

    return NextResponse.json(newCommission);
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 });
  }
}

// Mark commission as paid
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    let commissions: Commission[] = [];
    if (fs.existsSync(COMMISSIONS_FILE)) {
      const data = fs.readFileSync(COMMISSIONS_FILE, 'utf8');
      commissions = JSON.parse(data);
    }

    const commissionIndex = commissions.findIndex(c => c.id === id);
    if (commissionIndex === -1) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    commissions[commissionIndex].status = 'paid';
    commissions[commissionIndex].paidAt = new Date().toISOString();

    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(commissions, null, 2));

    return NextResponse.json(commissions[commissionIndex]);
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}
