'use client';

import { useEffect, useState } from 'react';
import JobCard from './JobCard';

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
  recommendationScore?: number;
  recommendationReasons?: string[];
}

interface UserProfile {
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredBudget?: number;
  interests?: string[];
}

const JobRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    skills: ['React', 'JavaScript', 'Python'],
    experienceLevel: 'intermediate',
    preferredBudget: 2000
  });

  useEffect(() => {
    fetchRecommendations();
  }, [userProfile]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile })
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Personalized Job Recommendations</h2>
        
        {/* User Profile Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <input
                type="text"
                value={userProfile.skills.join(', ')}
                onChange={(e) => updateProfile('skills', e.target.value.split(', '))}
                className="w-full p-2 border rounded"
                placeholder="React, Python, JavaScript"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience Level</label>
              <select
                value={userProfile.experienceLevel}
                onChange={(e) => updateProfile('experienceLevel', e.target.value as UserProfile['experienceLevel'])}
                className="w-full p-2 border rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Budget ($)</label>
              <input
                type="number"
                value={userProfile.preferredBudget || ''}
                onChange={(e) => updateProfile('preferredBudget', parseInt(e.target.value) || undefined)}
                className="w-full p-2 border rounded"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {loading ? (
          <div className="text-center py-8">Loading recommendations...</div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended for You</h3>
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recommendations found. Try adjusting your profile.
              </div>
            ) : (
              recommendations.map((job) => (
                <div key={job.id} className="relative">
                  <JobCard job={job} />
                  {(job as any).recommendationScore && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {Math.round((job as any).recommendationScore)}% match
                    </div>
                  )}
                  {(job as any).recommendationReasons && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Why recommended:</strong> {(job as any).recommendationReasons.join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
