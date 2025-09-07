'use client';

import { useState, useEffect } from 'react';

interface JobData {
  id: string;
  title: string;
  skills: string[];
  rate: number;
  location: string;
  remote: boolean;
  experience: 'entry' | 'mid' | 'senior';
  industry: string;
  createdAt: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export default function InteractiveDashboard() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: 'all',
    industry: 'all',
    experience: 'all',
    remote: 'all',
    skills: [] as string[]
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activeChart, setActiveChart] = useState<'demand' | 'salary' | 'skills'>('demand');

  useEffect(() => {
    loadJobData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  useEffect(() => {
    generateChartData();
  }, [filteredJobs, activeChart]);

  const loadJobData = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      // Transform data to include additional fields for demo
      const transformedData = data.map((job: any, index: number) => ({
        id: job.id || `job-${index}`,
        title: job.title,
        skills: job.skills || [],
        rate: job.budget || job.rate || Math.floor(Math.random() * 100) + 50,
        location: ['San Francisco', 'New York', 'London', 'Berlin', 'Remote'][Math.floor(Math.random() * 5)],
        remote: Math.random() > 0.5,
        experience: ['entry', 'mid', 'senior'][Math.floor(Math.random() * 3)] as 'entry' | 'mid' | 'senior',
        industry: ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare'][Math.floor(Math.random() * 5)],
        createdAt: new Date().toISOString()
      }));

      setJobs(transformedData);
    } catch (error) {
      console.error('Error loading job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.region !== 'all') {
      filtered = filtered.filter(job => job.location === filters.region);
    }

    if (filters.industry !== 'all') {
      filtered = filtered.filter(job => job.industry === filters.industry);
    }

    if (filters.experience !== 'all') {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    if (filters.remote !== 'all') {
      const isRemote = filters.remote === 'remote';
      filtered = filtered.filter(job => job.remote === isRemote);
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(job =>
        filters.skills.some(skill =>
          job.skills.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredJobs(filtered);
  };

  const generateChartData = () => {
    if (filteredJobs.length === 0) {
      setChartData(null);
      return;
    }

    switch (activeChart) {
      case 'demand':
        generateDemandChart();
        break;
      case 'salary':
        generateSalaryChart();
        break;
      case 'skills':
        generateSkillsChart();
        break;
    }
  };

  const generateDemandChart = () => {
    const industryCount: Record<string, number> = {};
    filteredJobs.forEach(job => {
      industryCount[job.industry] = (industryCount[job.industry] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(industryCount),
      datasets: [{
        label: 'Job Demand by Industry',
        data: Object.values(industryCount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 1
      }]
    });
  };

  const generateSalaryChart = () => {
    const experienceSalary: Record<string, number[]> = {
      entry: [],
      mid: [],
      senior: []
    };

    filteredJobs.forEach(job => {
      if (job.rate && job.rate > 0) {
        experienceSalary[job.experience].push(job.rate);
      }
    });

    const avgSalaries = Object.entries(experienceSalary).map(([exp, rates]) => ({
      exp,
      avg: rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0
    }));

    setChartData({
      labels: avgSalaries.map(item => item.exp.charAt(0).toUpperCase() + item.exp.slice(1)),
      datasets: [{
        label: 'Average Salary by Experience',
        data: avgSalaries.map(item => Math.round(item.avg)),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    });
  };

  const generateSkillsChart = () => {
    const skillCount: Record<string, number> = {};
    filteredJobs.forEach(job => {
      job.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    setChartData({
      labels: topSkills.map(([skill]) => skill),
      datasets: [{
        label: 'Top Skills Demand',
        data: topSkills.map(([,count]) => count),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }]
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSkillFilter = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const exportReport = () => {
    const reportData = {
      filters,
      totalJobs: filteredJobs.length,
      averageSalary: filteredJobs.reduce((sum, job) => sum + (job.rate || 0), 0) / filteredJobs.length,
      topSkills: Object.entries(
        filteredJobs.reduce((acc, job) => {
          job.skills.forEach(skill => {
            acc[skill] = (acc[skill] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 5),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive Market Dashboard</h1>
            <p className="text-gray-600 mt-2">Explore freelance market data with dynamic filters and visualizations</p>
          </div>
          <button
            onClick={exportReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            📊 Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
            <div className="text-sm text-blue-800">Total Jobs</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(filteredJobs.reduce((sum, job) => sum + (job.rate || 0), 0) / Math.max(filteredJobs.length, 1))}
            </div>
            <div className="text-sm text-green-800">Avg Rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredJobs.filter(job => job.remote).length}
            </div>
            <div className="text-sm text-purple-800">Remote Jobs</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredJobs.flatMap(job => job.skills)).size}
            </div>
            <div className="text-sm text-orange-800">Unique Skills</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={filters.region}
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
              value={filters.industry}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <select
              value={filters.experience}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
            <select
              value={filters.remote}
              onChange={(e) => handleFilterChange('remote', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="remote">Remote Only</option>
              <option value="office">Office Only</option>
            </select>
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {filters.skills.map(skill => (
              <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {skill}
                <button
                  onClick={() => removeSkillFilter(skill)}
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
              placeholder="Add skill filter..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  addSkillFilter(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Data Visualization</h2>
          <div className="flex gap-2">
            {[
              { key: 'demand', label: 'Demand by Industry', icon: '📊' },
              { key: 'salary', label: 'Salary by Experience', icon: '💰' },
              { key: 'skills', label: 'Top Skills', icon: '🛠️' }
            ].map(chart => (
              <button
                key={chart.key}
                onClick={() => setActiveChart(chart.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeChart === chart.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {chart.icon} {chart.label}
              </button>
            ))}
          </div>
        </div>

        {chartData ? (
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeChart === 'demand' && 'Industry Demand Chart'}
                {activeChart === 'salary' && 'Salary Analysis Chart'}
                {activeChart === 'skills' && 'Skills Demand Chart'}
              </h3>
              <p className="text-gray-600 mb-4">
                Interactive chart would be rendered here with a charting library like Chart.js or Recharts
              </p>
              <div className="bg-white p-4 rounded border max-w-md mx-auto">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(chartData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600">No data available for the selected filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Job Listings ({filteredJobs.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.slice(0, 10).map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.remote ? '🌍 Remote' : job.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${job.rate}/hr</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-xs text-gray-400">+{job.skills.length - 3} more</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredJobs.length > 10 && (
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">Showing 10 of {filteredJobs.length} jobs</p>
          </div>
        )}
      </div>
    </div>
  );
}
