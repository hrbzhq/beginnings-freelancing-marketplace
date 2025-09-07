import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'subscriptions.json');

interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  features: string[];
}

export async function GET() {
  try {
    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId: body.userId || 'anonymous',
      plan: body.plan || 'basic',
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      features: getPlanFeatures(body.plan || 'basic')
    };

    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    subscriptions.push(newSubscription);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));

    return NextResponse.json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

function getPlanFeatures(plan: string): string[] {
  switch (plan) {
    case 'basic':
      return [
        'Basic job search',
        'Limited AI ratings',
        'Email notifications'
      ];
    case 'premium':
      return [
        'Advanced job search',
        'Full AI ratings & analysis',
        'Priority notifications',
        'Employer insights',
        'Resume optimization tips'
      ];
    case 'enterprise':
      return [
        'All premium features',
        'Bulk job analysis',
        'Custom AI training',
        'API access',
        'Dedicated support'
      ];
    default:
      return ['Basic job search'];
  }
}
