'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  summary: string;
  category: string;
  price: number;
  charts: {
    id: string;
    title: string;
    type: 'bar' | 'line' | 'pie';
    data: any[];
    isPreview: boolean;
  }[];
  fullContent?: string;
  isPreview: boolean;
}

interface ReportPreviewProps {
  reportId: string;
  userTier?: string;
}

export default function ReportPreview({ reportId, userTier = 'free' }: ReportPreviewProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}?preview=true`);
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        } else {
          console.error('Failed to fetch report');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handlePurchase = () => {
    // In a real app, this would redirect to payment
    alert('Redirecting to payment...');
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Report Not Found</h2>
          <p className="text-gray-600 mt-2">The requested report could not be found.</p>
        </div>
      </div>
    );
  }

  const visibleCharts = report.isPreview ? report.charts.slice(0, 2) : report.charts;
  const hiddenCharts = report.isPreview ? report.charts.slice(2) : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Report Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-600 mt-2">{report.summary}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">{report.category}</Badge>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">${report.price}</span>
              </div>
            </div>
          </div>

          {report.isPreview && (
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                <Lock className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
              <p className="text-sm text-gray-600">
                Upgrade to see full report
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {visibleCharts.map((chart) => (
          <Card key={chart.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {chart.type === 'line' && <TrendingUp className="h-5 w-5" />}
                {chart.type === 'bar' && <Users className="h-5 w-5" />}
                {chart.type === 'pie' && <Eye className="h-5 w-5" />}
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mock chart visualization */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {chart.type === 'line' && '📈'}
                    {chart.type === 'bar' && '📊'}
                    {chart.type === 'pie' && '🥧'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {chart.type === 'line' && 'Salary trend visualization'}
                    {chart.type === 'bar' && 'Demand growth chart'}
                    {chart.type === 'pie' && 'Distribution analysis'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Data points: {chart.data.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Hidden Charts Preview */}
        {hiddenCharts.map((chart) => (
          <Card key={chart.id} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-75" />
                <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
                <p className="text-sm opacity-90 mb-4">
                  Unlock this chart and 2 more with full access
                </p>
                <Button onClick={handleUpgrade} size="sm">
                  Upgrade Now
                </Button>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {chart.type === 'line' && <TrendingUp className="h-5 w-5" />}
                {chart.type === 'bar' && <Users className="h-5 w-5" />}
                {chart.type === 'pie' && <Eye className="h-5 w-5" />}
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Premium Content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      {report.isPreview ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Unlock the Full Report
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get access to all charts, detailed analysis, and actionable insights.
                Join thousands of professionals making data-driven career decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handlePurchase} size="lg" className="px-8">
                  <Download className="h-5 w-5 mr-2" />
                  Purchase Report - ${report.price}
                </Button>
                <Button onClick={handleUpgrade} variant="outline" size="lg">
                  View Pricing Plans
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>✓ Instant download after purchase</p>
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Lifetime access to this report</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <Button onClick={() => alert('Downloading full report...')} size="lg">
            <Download className="h-5 w-5 mr-2" />
            Download Full Report
          </Button>
        </div>
      )}
    </div>
  );
}
