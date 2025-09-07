'use client';

import { useState, useEffect } from 'react';

interface MarketReport {
  id: string;
  title: string;
  type: 'skills_demand' | 'salary_trends' | 'industry_growth' | 'freelancer_demographics';
  content: string;
  price: number;
  createdAt: string;
  downloads: number;
}

export default function ReportsMarketplace() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (reportId: string) => {
    setPurchasing(reportId);
    try {
      const response = await fetch('/api/reports/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          userId: 'user-123', // In production, get from auth
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Report purchased successfully!');
        // In production, trigger download or redirect to download page
        handleDownload(reportId);
      } else {
        alert('Purchase failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error purchasing report:', error);
      alert('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/download/${reportId}?userId=user-123`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Download failed');
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'skills_demand': return 'bg-blue-100 text-blue-800';
      case 'salary_trends': return 'bg-green-100 text-green-800';
      case 'industry_growth': return 'bg-purple-100 text-purple-800';
      case 'freelancer_demographics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                {report.type.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                {report.downloads} downloads
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {report.title}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {report.content.substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(report.price)}
              </span>

              <button
                onClick={() => handlePurchase(report.id)}
                disabled={purchasing === report.id}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {purchasing === report.id ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reports available at the moment.</p>
          <button
            onClick={fetchReports}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
