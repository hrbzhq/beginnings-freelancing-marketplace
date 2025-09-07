import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // Probability weight for this variant
  content: any;
}

interface Experiment {
  id: string;
  name: string;
  variants: ExperimentVariant[];
  isActive: boolean;
}

// Mock experiments - in production, this would come from database
const experiments: Record<string, Experiment> = {
  'pricing_page_headline': {
    id: 'pricing_page_headline',
    name: 'Pricing Page Headline Test',
    isActive: true,
    variants: [
      {
        id: 'control',
        name: 'Control',
        weight: 50,
        content: {
          headline: 'Choose Your Plan',
          subheadline: 'Select the perfect plan for your career growth'
        }
      },
      {
        id: 'value_focused',
        name: 'Value Focused',
        weight: 30,
        content: {
          headline: 'Get Unlimited Access to Market Intelligence',
          subheadline: 'Everything you need to accelerate your career'
        }
      },
      {
        id: 'urgency_driven',
        name: 'Urgency Driven',
        weight: 20,
        content: {
          headline: 'Limited Time: 50% Off First Month',
          subheadline: 'Don\'t miss out on premium career insights'
        }
      }
    ]
  },
  'cta_button_text': {
    id: 'cta_button_text',
    name: 'CTA Button Text Test',
    isActive: true,
    variants: [
      {
        id: 'control',
        name: 'Control',
        weight: 40,
        content: {
          text: 'Get Started',
          color: 'primary'
        }
      },
      {
        id: 'benefit_focused',
        name: 'Benefit Focused',
        weight: 35,
        content: {
          text: 'Start My Career Boost',
          color: 'primary'
        }
      },
      {
        id: 'action_oriented',
        name: 'Action Oriented',
        weight: 25,
        content: {
          text: 'Upgrade Now',
          color: 'secondary'
        }
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ experimentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { experimentId } = await params;

    const experiment = experiments[experimentId];
    if (!experiment || !experiment.isActive) {
      return NextResponse.json(
        { error: 'Experiment not found or inactive' },
        { status: 404 }
      );
    }

    // Simple random selection based on weights
    const totalWeight = experiment.variants.reduce((sum, variant) => sum + variant.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedVariant: ExperimentVariant | null = null;
    for (const variant of experiment.variants) {
      random -= variant.weight;
      if (random <= 0) {
        selectedVariant = variant;
        break;
      }
    }

    if (!selectedVariant) {
      selectedVariant = experiment.variants[0]; // Fallback to first variant
    }

    // Log the experiment exposure
    if (userId) {
      await prisma.analyticsEvent.create({
        data: {
          userId: userId,
          type: 'experiment_exposure',
          metadata: {
            experimentId: experimentId,
            variantId: selectedVariant.id,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    return NextResponse.json({
      experimentId: experiment.id,
      variantId: selectedVariant.id,
      content: selectedVariant.content
    });
  } catch (error) {
    console.error('Error getting experiment variant:', error);
    return NextResponse.json(
      { error: 'Failed to get experiment variant' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ experimentId: string }> }
) {
  try {
    const body = await request.json();
    const { userId, variantId, eventType, metadata } = body;
    const { experimentId } = await params;

    if (!userId || !variantId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, variantId, eventType' },
        { status: 400 }
      );
    }

    // Log the experiment event
    await prisma.analyticsEvent.create({
      data: {
        userId: userId,
        type: `experiment_${eventType}`,
        metadata: {
          experimentId: experimentId,
          variantId: variantId,
          eventType: eventType,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging experiment event:', error);
    return NextResponse.json(
      { error: 'Failed to log experiment event' },
      { status: 500 }
    );
  }
}
