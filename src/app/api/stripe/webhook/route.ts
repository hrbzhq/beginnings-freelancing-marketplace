import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;

        // Find user by customer email
        const customerEmail = session.customer_details?.email;
        if (!customerEmail) {
          return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
          where: { email: customerEmail }
        });

        if (!user) {
          console.error('User not found for completed checkout');
          return NextResponse.json({ error: 'User not found' }, { status: 400 });
        }

        // Create or update subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription) as any;
        const priceId = subscription.items.data[0].price.id;

        // Map price ID to tier
        const tierMapping: Record<string, string> = {
          [process.env.STRIPE_PRICE_PRO || 'price_pro']: 'pro',
          [process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly']: 'pro',
          [process.env.STRIPE_PRICE_TEAM || 'price_team']: 'team',
          [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise']: 'enterprise',
        };

        const tier = tierMapping[priceId] || 'pro';

        // Find existing subscription or create new one
        const existingSubscription = await prisma.subscription.findFirst({
          where: { userId: user.id }
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              tier,
              status: 'active',
              endDate: new Date(subscription.current_period_end * 1000),
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              tier,
              status: 'active',
              endDate: new Date(subscription.current_period_end * 1000),
            },
          });
        }

        // Log the purchase
        await prisma.purchase.create({
          data: {
            userId: user.id,
            reportId: 'subscription',
            amount: subscription.items.data[0].price.unit_amount! / 100,
            status: 'completed',
          },
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;

        const customerEmail = invoice.customer_email;
        if (!customerEmail) {
          return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
          where: { email: customerEmail }
        });

        if (user) {
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: 'active' },
          });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        const customerEmail = invoice.customer_email;
        if (!customerEmail) {
          return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
          where: { email: customerEmail }
        });

        if (user) {
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: 'cancelled' },
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        const customerEmail = subscription.customer?.email;
        if (!customerEmail) {
          return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
          where: { email: customerEmail }
        });

        if (user) {
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: 'cancelled' },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
