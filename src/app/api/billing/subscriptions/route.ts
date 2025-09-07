import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, tierId, billingInterval = 'month' } = await request.json();

    if (!userId || !tierId) {
      return NextResponse.json(
        { error: 'User ID and tier ID are required' },
        { status: 400 }
      );
    }

    // Get tier pricing (in a real app, this would come from a pricing configuration)
    const tierPricing = {
      free: { month: 0, year: 0 },
      pro: { month: 29, year: 348 }, // 20% discount
      team: { month: 99, year: 1188 },
      enterprise: { month: 299, year: 3588 }
    };

    const price = tierPricing[tierId as keyof typeof tierPricing]?.[billingInterval] || 0;

    // Create or update subscription
    let subscription = await prisma.subscription.findFirst({
      where: { userId: userId }
    });

    if (subscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: tierId,
          status: 'active',
          startDate: new Date(),
          endDate: billingInterval === 'year'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId: userId,
          tier: tierId,
          status: 'active',
          startDate: new Date(),
          endDate: billingInterval === 'year'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Log the subscription event
    await prisma.analyticsEvent.create({
      data: {
        type: 'subscription_created',
        userId: userId,
        metadata: {
          tier: tierId,
          billingInterval,
          price
        }
      }
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully subscribed to ${tierId} plan`
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId }
    });

    return NextResponse.json({ subscription });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, tierId, billingInterval } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (tierId) updateData.tier = tierId;
    if (billingInterval) {
      updateData.endDate = billingInterval === 'year'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData
    });

    // Log the update event
    await prisma.analyticsEvent.create({
      data: {
        type: 'subscription_updated',
        userId: userId,
        metadata: {
          tier: tierId,
          billingInterval
        }
      }
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Find the subscription first
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription status to cancelled
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        endDate: new Date() // End immediately
      }
    });

    // Log the cancellation event
    await prisma.analyticsEvent.create({
      data: {
        type: 'subscription_cancelled',
        userId: userId,
        metadata: {
          tier: updatedSubscription.tier,
          cancelledAt: new Date()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
