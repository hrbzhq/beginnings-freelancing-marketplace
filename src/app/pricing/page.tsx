'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Building } from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started with basic insights',
    features: [
      '5 job searches per day',
      'Basic market insights',
      'Email notifications',
      'Community support'
    ],
    icon: <Star className="h-6 w-6" />,
    buttonText: 'Get Started',
    buttonVariant: 'outline'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    description: 'Advanced insights for freelancers and small teams',
    features: [
      'Unlimited job searches',
      'Advanced market analytics',
      'Custom report generation',
      'Priority email support',
      'Export data',
      'Trend notifications'
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default'
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    interval: 'month',
    description: 'Complete solution for growing agencies and teams',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Advanced analytics dashboard',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      'Bulk report generation'
    ],
    icon: <Building className="h-6 w-6" />,
    buttonText: 'Start Team Trial',
    buttonVariant: 'default'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Team',
      'Custom AI model training',
      'White-label solution',
      'API access',
      'Custom integrations',
      '24/7 phone support',
      'Dedicated success manager'
    ],
    icon: <Building className="h-6 w-6" />,
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary'
  }
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'enterprise') {
      // Open contact form or redirect to sales page
      window.open('/contact-sales', '_blank');
      return;
    }

    // In a real app, this would integrate with Stripe or another payment processor
    console.log(`Subscribing to ${tierId} plan`);

    // Mock subscription flow
    alert(`Thank you for choosing the ${tierId} plan! In a real implementation, this would redirect to payment processing.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlock the power of AI-driven freelancing insights
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 border">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>

                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${billingInterval === 'year' && tier.price > 0
                      ? Math.round(tier.price * 12 * 0.8)
                      : tier.price}
                    <span className="text-lg font-normal text-gray-600">
                      /{billingInterval === 'year' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingInterval === 'year' && tier.price > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      ${tier.price}/month billed annually
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  variant={tier.buttonVariant}
                  className="w-full"
                  size="lg"
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                  and we'll prorate any charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we offer a 14-day free trial for Pro and Team plans. No credit card required to start.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! You can cancel your subscription at any time. You'll continue to have access
                  until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
