'use client';

import { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import MarketInsights from '../components/MarketInsights';
import ReportsMarketplace from '../components/ReportsMarketplace';
import UserDashboard from '../components/UserDashboard';
import InteractiveDashboard from '../components/InteractiveDashboard';
import CustomReportGenerator from '../components/CustomReportGenerator';
import JobRecommendations from '../components/JobRecommendations';

interface Job {
  id: string;
  title: string;
  description: string;
  employer: string;
  budget: number;
  skills: string[];
  ratings: {
    difficulty: number;
    prospects: number;
    fun: number;
  };
  employerRatings?: {
    credit: number;
    salary: number;
    attitude: number;
    prospects: number;
  };
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [evaluation, setEvaluation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'insights' | 'reports' | 'dashboard' | 'interactive' | 'custom-reports' | 'recommendations'>('dashboard');

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
      fetchLastEvaluation();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchLastEvaluation = async () => {
    try {
      const response = await fetch('/api/evaluate');
      const data = await response.json();
      if (data.evaluation) {
        setLastEvaluation(data.evaluation + '\n\nOptimizations:\n' + data.optimizations);
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
  };

  const runEvaluation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/evaluate');
      const data = await response.json();
      const newEvaluation = data.evaluation + '\n\nOptimizations:\n' + data.optimizations;
      setEvaluation(newEvaluation);
      setLastEvaluation(newEvaluation);
    } catch (error) {
      console.error('Error running evaluation:', error);
      setEvaluation('Evaluation failed. Please check Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'My Dashboard', icon: '👤' },
    { id: 'jobs', label: 'Job Market', icon: '💼' },
    { id: 'recommendations', label: 'Recommendations', icon: '🎯' },
    { id: 'insights', label: 'Market Insights', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'interactive', label: 'Interactive Dashboard', icon: '🎛️' },
    { id: 'custom-reports', label: 'Custom Reports', icon: '🔧' }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Beginnings - Freelancing Marketplace</h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <UserDashboard />
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <>
          <div className="mb-4 flex gap-4 flex-wrap justify-center">
            <button
              onClick={fetchJobs}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Jobs
            </button>
            <button
              onClick={runEvaluation}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Run Self-Evaluation'}
            </button>
            <button
              onClick={() => setEvaluation('')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {evaluation && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Latest Evaluation</h2>
              <pre className="whitespace-pre-wrap text-sm">{evaluation}</pre>
            </div>
          )}

          {!evaluation && lastEvaluation && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Last Evaluation</h2>
              <pre className="whitespace-pre-wrap text-sm">{lastEvaluation}</pre>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <MarketInsights />
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <JobRecommendations />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <ReportsMarketplace />
      )}

      {/* Interactive Dashboard Tab */}
      {activeTab === 'interactive' && (
        <InteractiveDashboard />
      )}

      {/* Custom Reports Tab */}
      {activeTab === 'custom-reports' && (
        <CustomReportGenerator />
      )}
    </div>
  );
}
