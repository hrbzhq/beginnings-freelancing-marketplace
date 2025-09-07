'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  summary: string;
  category: string;
  price: number;
  createdAt: string;
}

export default function ReportsPage() {
  // Mock reports data
  const reports: Report[] = [
    {
      id: 'react-2025',
      title: 'React Developer Market Analysis 2025',
      summary: 'Comprehensive analysis of React developer demand, salary trends, and market opportunities in 2025.',
      category: 'Technology',
      price: 49,
      createdAt: new Date().toISOString()
    },
    {
      id: 'python-2025',
      title: 'Python Developer Salary Report 2025',
      summary: 'In-depth analysis of Python developer compensation, demand growth, and regional variations.',
      category: 'Technology',
      price: 39,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ux-design-2025',
      title: 'UX Design Market Trends 2025',
      summary: 'Latest trends in UX design salaries, remote work opportunities, and skill requirements.',
      category: 'Design',
      price: 45,
      createdAt: new Date().toISOString()
    },
    {
      id: 'data-science-2025',
      title: 'Data Science Career Guide 2025',
      summary: 'Complete overview of data science job market, salary ranges, and required certifications.',
      category: 'Data',
      price: 55,
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Market Intelligence Reports
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Data-driven insights to accelerate your career growth
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Badge variant="secondary" className="px-3 py-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Salary Trends
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-4 w-4 mr-1" />
            Demand Analysis
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <DollarSign className="h-4 w-4 mr-1" />
            Market Insights
          </Badge>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{report.title}</CardTitle>
                  <CardDescription className="text-base mb-3">
                    {report.summary}
                  </CardDescription>
                </div>
                <Badge variant="outline">{report.category}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ${report.price}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Updated {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/reports/${report.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Report
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/reports/${report.id}`}>
                    <Download className="h-4 w-4 mr-2" />
                    Buy Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Unlock Premium Market Intelligence
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get unlimited access to all reports, real-time market data, and personalized career insights.
              Join thousands of professionals making data-driven career decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Download className="h-5 w-5 mr-2" />
                View Subscription Plans
              </Button>
              <Button variant="outline" size="lg">
                Try Free Preview
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Free report previews</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Real-time market data</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Personalized insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
