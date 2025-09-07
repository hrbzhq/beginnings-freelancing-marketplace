import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'subscriptions.json');

interface Subscription {
  id: string;
  userId: string;
  trendType: 'skill' | 'industry' | 'location';
  trendValue: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  lastNotified?: string;
}

// Initialize subscriptions file if it doesn't exist
if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    if (userId) {
      const userSubscriptions = subscriptions.filter(sub => sub.userId === userId && sub.isActive);
      return NextResponse.json(userSubscriptions);
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
    const { userId, trendType, trendValue, frequency = 'weekly' } = body;

    if (!userId || !trendType || !trendValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    // Check if subscription already exists
    const existingSubscription = subscriptions.find(sub =>
      sub.userId === userId &&
      sub.trendType === trendType &&
      sub.trendValue === trendValue &&
      sub.isActive
    );

    if (existingSubscription) {
      return NextResponse.json({ error: 'Subscription already exists' }, { status: 400 });
    }

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId,
      trendType,
      trendValue,
      frequency,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    subscriptions.push(newSubscription);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));

    return NextResponse.json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, isActive } = body;

    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (subscriptionIndex === -1) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    subscriptions[subscriptionIndex].isActive = isActive;
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));

    return NextResponse.json(subscriptions[subscriptionIndex]);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    let subscriptions: Subscription[] = [];
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptions = JSON.parse(data);
    }

    const filteredSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filteredSubscriptions, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
