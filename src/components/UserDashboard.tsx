'use client';

import { useState, useEffect } from 'react';

interface PersonalizedInsight {
  id: string;
  skill: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
  relevance: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  skills: string[];
  subscribedTrends: string[];
}

interface Subscription {
  id: string;
  trendType: 'skill' | 'industry' | 'location';
  trendValue: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'trend_alert' | 'market_update' | 'opportunity';
  isRead: boolean;
  createdAt: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    trendType: 'skill' as const,
    trendValue: '',
    frequency: 'weekly' as const
  });

  // Mock user for demo - in production, get from auth
  const mockUserId = 'user-123';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user profile
      const userResponse = await fetch(`/api/users?userId=${mockUserId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        // Create demo user if not exists
        await createDemoUser();
      }

      // Load personalized insights
      const insightsResponse = await fetch(`/api/insights/personalized?userId=${mockUserId}`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights || []);
      }

      // Load subscriptions
      const subscriptionsResponse = await fetch(`/api/subscriptions?userId=${mockUserId}`);
      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json();
        setSubscriptions(subscriptionsData);
      }

      // Load notifications
      const notificationsResponse = await fetch(`/api/notifications?userId=${mockUserId}`);
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@example.com',
          name: 'Demo User',
          skills: ['React', 'JavaScript', 'Python']
        })
      });
      const newUser = await response.json();
      setUser(newUser);
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;

    const updatedSkills = [...user.skills, newSkill.trim()];
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          skills: updatedSkills
        })
      });
      const updatedUser = await response.json();
      setUser(updatedUser);
      setNewSkill('');
      setEditingSkills(false);
      // Reload insights with new skills
      loadUserData();
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!user) return;

    const updatedSkills = user.skills.filter(skill => skill !== skillToRemove);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          skills: updatedSkills
        })
      });
      const updatedUser = await response.json();
      setUser(updatedUser);
      // Reload insights with updated skills
      loadUserData();
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const addSubscription = async () => {
    if (!newSubscription.trendValue.trim()) return;

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUserId,
          ...newSubscription
        })
      });
      const subscription = await response.json();
      setSubscriptions([...subscriptions, subscription]);
      setNewSubscription({
        trendType: 'skill',
        trendValue: '',
        frequency: 'weekly'
      });
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  const removeSubscription = async (subscriptionId: string) => {
    try {
      await fetch(`/api/subscriptions?id=${subscriptionId}`, {
        method: 'DELETE'
      });
      setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
    } catch (error) {
      console.error('Error removing subscription:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          isRead: true
        })
      });
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'border-l-green-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
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
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h2>

        {user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome back, {user.name}!</h3>
              <p className="text-gray-600">Here are personalized insights based on your skills</p>
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-gray-900">Your Skills</h4>
                <button
                  onClick={() => setEditingSkills(!editingSkills)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {editingSkills ? 'Cancel' : 'Edit Skills'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {user.skills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {skill}
                    {editingSkills && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {editingSkills && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trend Subscriptions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Trend Subscriptions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
            >
              🔔 Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications yet</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded border-l-4 ${
                      notification.isRead ? 'border-gray-300 bg-white' : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add New Subscription */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-semibold mb-3">Subscribe to Trends</h3>
          <div className="flex gap-2 flex-wrap">
            <select
              value={newSubscription.trendType}
              onChange={(e) => setNewSubscription({
                ...newSubscription,
                trendType: e.target.value as any
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="skill">Skill</option>
              <option value="industry">Industry</option>
              <option value="location">Location</option>
            </select>
            <input
              type="text"
              value={newSubscription.trendValue}
              onChange={(e) => setNewSubscription({
                ...newSubscription,
                trendValue: e.target.value
              })}
              placeholder={`Enter ${newSubscription.trendType}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addSubscription()}
            />
            <select
              value={newSubscription.frequency}
              onChange={(e) => setNewSubscription({
                ...newSubscription,
                frequency: e.target.value as any
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={addSubscription}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Current Subscriptions */}
        <div>
          <h3 className="text-md font-semibold mb-3">My Subscriptions</h3>
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No active subscriptions</p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium capitalize">{subscription.trendType}: </span>
                    <span className="text-gray-700">{subscription.trendValue}</span>
                    <span className="text-sm text-gray-500 ml-2">({subscription.frequency})</span>
                  </div>
                  <button
                    onClick={() => removeSubscription(subscription.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Unsubscribe
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personalized Insights Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Insights</h2>

        {insights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No personalized insights available yet.</p>
            <p className="text-sm text-gray-400">Add more skills to get relevant market insights!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <div key={insight.id} className={`border-l-4 p-4 rounded-lg hover:shadow-md transition-shadow ${getRelevanceColor(insight.relevance)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{insight.skill}</span>
                  <span className={`text-sm font-medium ${getChangeColor(insight.changeType)}`}>
                    {insight.change > 0 ? '+' : ''}{insight.change}%
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {insight.title}
                </h3>

                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {insight.title.includes('Rate') ? `$${insight.value}` : insight.value}
                  {insight.title.includes('Remote') && '%'}
                </div>

                <p className="text-sm text-gray-600">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={loadUserData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Insights
          </button>
        </div>
      </div>
    </div>
  );
}
