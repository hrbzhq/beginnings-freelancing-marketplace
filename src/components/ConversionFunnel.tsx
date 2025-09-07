'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Eye, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  percentage: number;
  color: string;
}

interface ConversionFunnelProps {
  userId?: string;
  timeRange?: '7d' | '30d' | '90d';
}

export default function ConversionFunnel({
  userId,
  timeRange = '30d'
}: ConversionFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock funnel data - in production, this would come from analytics API
  const mockFunnelData: FunnelStep[] = [
    {
      id: 'page_views',
      name: 'Page Views',
      icon: <Eye className="h-5 w-5" />,
      count: 10000,
      percentage: 100,
      color: 'bg-blue-500'
    },
    {
      id: 'report_previews',
      name: 'Report Previews',
      icon: <Users className="h-5 w-5" />,
      count: 2500,
      percentage: 25,
      color: 'bg-green-500'
    },
    {
      id: 'add_to_cart',
      name: 'Add to Cart',
      icon: <ShoppingCart className="h-5 w-5" />,
      count: 800,
      percentage: 8,
      color: 'bg-yellow-500'
    },
    {
      id: 'checkout_start',
      name: 'Checkout Started',
      icon: <CreditCard className="h-5 w-5" />,
      count: 600,
      percentage: 6,
      color: 'bg-orange-500'
    },
    {
      id: 'purchase_complete',
      name: 'Purchase Complete',
      icon: <CheckCircle className="h-5 w-5" />,
      count: 480,
      percentage: 4.8,
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFunnelData(mockFunnelData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Analyzing user journey through the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = funnelData.length > 1
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              User journey analysis for the last {timeRange}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {conversionRate}% Conversion
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {funnelData.map((step, index) => {
            const dropOffRate = index > 0
              ? (((funnelData[index - 1].count - step.count) / funnelData[index - 1].count) * 100).toFixed(1)
              : '0';

            return (
              <div key={step.id} className="relative">
                {/* Connection line to previous step */}
                {index > 0 && (
                  <div className="absolute -top-3 left-6 w-0.5 h-6 bg-gray-200"></div>
                )}

                <div className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>

                  {/* Step details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {step.count.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {step.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <Progress value={step.percentage} className="h-2" />
                    </div>

                    {/* Drop-off rate */}
                    {index > 0 && (
                      <div className="text-sm text-red-600">
                        {dropOffRate}% drop-off from previous step
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>25% of visitors preview reports, indicating strong interest in content</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>32% drop-off between preview and cart suggests pricing concerns</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>80% completion rate in checkout indicates smooth payment flow</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Overall 4.8% conversion rate shows room for optimization</span>
            </li>
          </ul>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Optimization Recommendations</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Add free trial or sample reports to reduce preview-to-cart drop-off</li>
            <li>• Implement exit-intent popups with discount offers</li>
            <li>• A/B test pricing page design and messaging</li>
            <li>• Add trust signals and testimonials to checkout</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
