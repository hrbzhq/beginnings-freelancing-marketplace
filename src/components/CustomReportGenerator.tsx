'use client';

import { useState } from 'react';

interface CustomReportConfig {
  title: string;
  filters: {
    region?: string;
    industry?: string;
    experience?: string;
    skills?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  visualizations: string[];
}

export default function CustomReportGenerator() {
  const [config, setConfig] = useState<CustomReportConfig>({
    title: '',
    filters: {
      skills: []
    },
    visualizations: []
  });
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const visualizationOptions = [
    { id: 'industry-demand', label: 'Industry Demand Chart', icon: '📊' },
    { id: 'salary-analysis', label: 'Salary Analysis', icon: '💰' },
    { id: 'skills-demand', label: 'Skills Demand', icon: '🛠️' },
    { id: 'regional-distribution', label: 'Regional Distribution', icon: '🌍' },
    { id: 'experience-levels', label: 'Experience Levels', icon: '📈' }
  ];

  const handleFilterChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !config.filters.skills?.includes(skill.trim())) {
      setConfig(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          skills: [...(prev.filters.skills || []), skill.trim()]
        }
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        skills: prev.filters.skills?.filter(s => s !== skill) || []
      }
    }));
  };

  const toggleVisualization = (vizId: string) => {
    setConfig(prev => ({
      ...prev,
      visualizations: prev.visualizations.includes(vizId)
        ? prev.visualizations.filter(v => v !== vizId)
        : [...prev.visualizations, vizId]
    }));
  };

  const generateReport = async () => {
    if (!config.title.trim()) {
      alert('Please enter a report title');
      return;
    }

    if (config.visualizations.length === 0) {
      alert('Please select at least one visualization');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/reports/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          userId: 'user-123' // In production, get from auth
        })
      });

      const report = await response.json();
      setGeneratedReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([JSON.stringify(generatedReport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Report Generator</h1>
        <p className="text-gray-600">Create personalized market analysis reports with custom filters and visualizations</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Report Configuration</h2>

        {/* Basic Info */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter report title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={config.filters.region || 'all'}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Regions</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="London">London</option>
                <option value="Berlin">Berlin</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={config.filters.industry || 'all'}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                value={config.filters.experience || 'all'}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...config.filters.dateRange,
                    start: e.target.value
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...config.filters.dateRange,
                    end: e.target.value
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {config.filters.skills?.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addSkill(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visualizationOptions.map(option => (
              <div
                key={option.id}
                onClick={() => toggleVisualization(option.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  config.visualizations.includes(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.label}</h4>
                  </div>
                </div>
                {config.visualizations.includes(option.id) && (
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {generating ? 'Generating Report...' : '🚀 Generate Custom Report'}
          </button>
        </div>
      </div>

      {/* Generated Report */}
      {generatedReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Generated Report</h2>
            <button
              onClick={downloadReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📥 Download Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{generatedReport.data.summary.totalJobs}</div>
              <div className="text-sm text-blue-800">Total Jobs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(generatedReport.data.summary.averageRate)}
              </div>
              <div className="text-sm text-green-800">Average Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(generatedReport.data.summary.remotePercentage)}%
              </div>
              <div className="text-sm text-purple-800">Remote Jobs</div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Report Preview</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {JSON.stringify(generatedReport, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
