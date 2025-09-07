import React, { useState } from 'react';

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

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  // Generate mini insights based on job data
  const generateMiniInsights = (job: Job) => {
    const insights = [];
    
    // Salary trend insight
    if (job.budget > 100) {
      insights.push({
        type: 'salary',
        label: 'High Budget',
        color: 'bg-green-100 text-green-800',
        icon: '💰',
        tooltip: `Budget: $${job.budget} (+15% above market average for ${job.skills.join(', ')} skills)`
      });
    } else if (job.budget > 50) {
      insights.push({
        type: 'salary',
        label: 'Mid Range',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '📈',
        tooltip: `Budget: $${job.budget} (Market average for similar roles)`
      });
    }
    
    // Demand growth based on skills
    if (job.skills.includes('React') || job.skills.includes('Python')) {
      insights.push({
        type: 'demand',
        label: 'High Demand',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔥',
        tooltip: `${job.skills.join(', ')} skills show 25% demand growth in the last quarter`
      });
    }
    
    // Prospects insight
    if (job.ratings.prospects > 7) {
      insights.push({
        type: 'prospects',
        label: 'Great Prospects',
        color: 'bg-purple-100 text-purple-800',
        icon: '⭐',
        tooltip: `Career prospects rating: ${job.ratings.prospects}/10 (Top 20% of opportunities)`
      });
    }
    
    return insights.slice(0, 3); // Limit to 3 badges
  };

  const miniInsights = generateMiniInsights(job);

  const handleMouseEnter = (event: React.MouseEvent, tooltipContent: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      content: tooltipContent,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleInsightClick = async (insight: any) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'insight_click',
          insightType: insight.type,
          jobId: job.id,
          userId: 'anonymous', // In a real app, this would be the logged-in user
          metadata: {
            label: insight.label,
            budget: job.budget,
            skills: job.skills
          }
        })
      });
      
      // Navigate to premium report or show more details
      alert(`Insight clicked: ${insight.label}. In a real app, this would navigate to a premium report.`);
    } catch (error) {
      console.error('Failed to track insight click:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow relative">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{job.title}</h3>
        <div className="flex gap-1">
          {miniInsights.map((insight, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${insight.color} cursor-pointer`}
              onMouseEnter={(e) => handleMouseEnter(e, insight.tooltip)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleInsightClick(insight)}
            >
              {insight.icon} {insight.label}
            </span>
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-2">{job.description}</p>
      <p className="text-sm font-medium mb-1">Employer: {job.employer}</p>
      <p className="text-sm mb-2">Budget: ${job.budget}</p>
      <div className="mb-2">
        <p className="text-sm font-medium">Skills: {job.skills.join(', ')}</p>
      </div>

      <div className="mb-3">
        <h4 className="font-medium mb-1">Job Ratings:</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Difficulty: {job.ratings.difficulty}/10</div>
          <div>Prospects: {job.ratings.prospects}/10</div>
          <div>Fun: {job.ratings.fun}/10</div>
        </div>
      </div>

      {job.employerRatings && (
        <div className="mb-3">
          <h4 className="font-medium mb-1">Employer Ratings:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Credit: {job.employerRatings.credit}/10</div>
            <div>Salary: {job.employerRatings.salary}/10</div>
            <div>Attitude: {job.employerRatings.attitude}/10</div>
            <div>Prospects: {job.employerRatings.prospects}/10</div>
          </div>
        </div>
      )}

      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Apply Now
      </button>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-10 pointer-events-none max-w-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
