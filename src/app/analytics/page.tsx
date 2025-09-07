'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConversionFunnel from '@/components/ConversionFunnel';
import { BarChart3, TrendingUp, Users, DollarSign, Eye, ShoppingCart, Calendar } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm ${changeColor[changeType]}`}>
              {change} from last month
            </p>
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+23.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-8 w-8" />
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: <Users className="h-8 w-8" />
    },
    {
      title: 'Page Views',
      value: '45,231',
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: <Eye className="h-8 w-8" />
    },
    {
      title: 'Conversion Rate',
      value: '4.8%',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: <TrendingUp className="h-8 w-8" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track performance and optimize your conversion funnel
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="experiments">A/B Tests</TabsTrigger>
          <TabsTrigger value="reports">Report Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-6">
          <ConversionFunnel timeRange={timeRange} />

          {/* Additional funnel insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Converting Pages</CardTitle>
                <CardDescription>Pages with highest conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: '/reports/react-2025', conversions: 145, rate: '12.3%' },
                    { page: '/reports/python-2025', conversions: 98, rate: '9.8%' },
                    { page: '/pricing', conversions: 234, rate: '8.7%' },
                    { page: '/reports/data-science-2025', conversions: 67, rate: '7.2%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.page}</p>
                        <p className="text-sm text-gray-500">{item.conversions} conversions</p>
                      </div>
                      <Badge variant="secondary">{item.rate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Organic Search', visitors: 15420, percentage: 45.2 },
                    { source: 'Direct', visitors: 8920, percentage: 26.1 },
                    { source: 'Social Media', visitors: 4560, percentage: 13.3 },
                    { source: 'Referral', visitors: 3240, percentage: 9.5 },
                    { source: 'Email', visitors: 2180, percentage: 5.9 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.source}</p>
                        <p className="text-sm text-gray-500">{item.visitors.toLocaleString()} visitors</p>
                      </div>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Test Results</CardTitle>
              <CardDescription>Performance of different content variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    name: 'Pricing Page Headline',
                    status: 'Running',
                    variants: [
                      { name: 'Control', conversions: 145, visitors: 1200, rate: '12.1%' },
                      { name: 'Value Focused', conversions: 167, visitors: 1180, rate: '14.2%' },
                      { name: 'Urgency Driven', conversions: 89, visitors: 1120, rate: '7.9%' }
                    ]
                  },
                  {
                    name: 'CTA Button Text',
                    status: 'Completed',
                    winner: 'Benefit Focused',
                    variants: [
                      { name: 'Get Started', conversions: 234, visitors: 1500, rate: '15.6%' },
                      { name: 'Start My Career Boost', conversions: 312, visitors: 1480, rate: '21.1%' },
                      { name: 'Upgrade Now', conversions: 198, visitors: 1520, rate: '13.0%' }
                    ]
                  }
                ].map((experiment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">{experiment.name}</h3>
                      <div className="flex items-center gap-2">
                        {experiment.winner && (
                          <Badge variant="secondary">Winner: {experiment.winner}</Badge>
                        )}
                        <Badge variant={experiment.status === 'Running' ? 'default' : 'secondary'}>
                          {experiment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {experiment.variants.map((variant, vIndex) => (
                        <div key={vIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-gray-500">
                              {variant.conversions} conversions / {variant.visitors} visitors
                            </p>
                          </div>
                          <Badge variant="outline" className="text-lg">
                            {variant.rate}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Performance</CardTitle>
              <CardDescription>Analytics for individual reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'React Developer Market Analysis 2025', views: 2847, purchases: 142, revenue: '$6,958', conversion: '5.0%' },
                  { title: 'Python Developer Salary Report 2025', views: 1923, purchases: 87, revenue: '$3,393', conversion: '4.5%' },
                  { title: 'UX Design Market Trends 2025', views: 1654, purchases: 95, revenue: '$4,275', conversion: '5.7%' },
                  { title: 'Data Science Career Guide 2025', views: 1432, purchases: 156, revenue: '$8,580', conversion: '10.9%' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                        <span>{report.views.toLocaleString()} views</span>
                        <span>{report.purchases} purchases</span>
                        <span>{report.revenue} revenue</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      {report.conversion}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Breakdown of revenue by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'Pro Monthly', revenue: '$4,250', subscribers: 85, percentage: 34.1 },
                    { plan: 'Pro Annual', revenue: '$3,840', subscribers: 32, percentage: 30.7 },
                    { plan: 'Team Monthly', revenue: '$2,560', subscribers: 16, percentage: 20.5 },
                    { plan: 'Enterprise', revenue: '$1,800', subscribers: 6, percentage: 14.4 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.plan}</p>
                        <p className="text-sm text-gray-500">{item.subscribers} subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.revenue}</p>
                        <p className="text-sm text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Revenue chart visualization</p>
                    <p className="text-sm text-gray-400 mt-2">
                      +23.5% growth this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
