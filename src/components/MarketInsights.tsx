'use client';

import { useState, useEffect } from 'react';

interface MarketInsight {
  id: string;
  category: 'demand' | 'supply' | 'pricing' | 'trends';
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
  timestamp: string;
}

export default function MarketInsights() {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'demand': return 'bg-blue-100 text-blue-800';
      case 'supply': return 'bg-green-100 text-green-800';
      case 'pricing': return 'bg-yellow-100 text-yellow-800';
      case 'trends': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(insight.category)}`}>
                {insight.category}
              </span>
              <span className={`text-sm font-medium ${getChangeColor(insight.changeType)}`}>
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {insight.title}
            </h3>

            <div className="text-2xl font-bold text-gray-900 mb-2">
              {insight.category === 'pricing' ? `$${insight.value}` : insight.value}
              {insight.category === 'trends' && '%'}
            </div>

            <p className="text-sm text-gray-600">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchInsights}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Insights
        </button>
      </div>
    </div>
  );
}
