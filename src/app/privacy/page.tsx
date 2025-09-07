'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, Shield, Eye, Lock } from 'lucide-react';

interface PrivacyData {
  user: {
    id: string;
    email: string;
    name: string | null;
    skills: any;
    experienceLevel: string;
    preferences: any;
    createdAt: string;
    updatedAt: string;
  };
  subscriptions: any[];
  purchases: any[];
  activity: any[];
  exportDate: string;
}

export default function PrivacyCenter() {
  const [userData, setUserData] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock user ID - in real app this would come from auth
  const userId = 'demo-user-id';

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/privacy/export?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoading(false);
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/privacy/export?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privacy-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    setExporting(false);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/privacy/export?userId=${userId}&confirm=true`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Account deleted successfully');
        // Redirect to home or login page
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Privacy Center
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal data and privacy settings
          </p>
        </div>

        <div className="grid gap-6">
          {/* Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Data Overview
              </CardTitle>
              <CardDescription>
                Summary of the data we have about you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : userData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Account Information</h4>
                      <p className="text-sm text-gray-600">Email: {userData.user.email}</p>
                      <p className="text-sm text-gray-600">Name: {userData.user.name || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Experience: {userData.user.experienceLevel}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Activity Summary</h4>
                      <p className="text-sm text-gray-600">Subscriptions: {userData.subscriptions.length}</p>
                      <p className="text-sm text-gray-600">Purchases: {userData.purchases.length}</p>
                      <p className="text-sm text-gray-600">Activity Events: {userData.activity.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Skills: {Array.isArray(userData.user.skills) ? userData.user.skills.length : 0}</Badge>
                    <Badge variant="secondary">Member since: {new Date(userData.user.createdAt).toLocaleDateString()}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Unable to load your data. Please try again.</p>
              )}
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download a complete copy of your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                This will include your profile information, subscription history, purchase records, and activity data.
              </p>
              <Button onClick={exportData} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Download Data Export'}
              </Button>
            </CardContent>
          </Card>

          {/* Data Deletion */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Your Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertDescription>
                  This action cannot be undone. All your data, including subscriptions, purchases, and activity history will be permanently deleted.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-red-600 font-medium">
                    Are you sure you want to delete your account? This action is irreversible.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                Our commitment to your privacy and data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Collection</h4>
                  <p>We collect minimal personal information necessary to provide our AI-powered freelancing insights.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Usage</h4>
                  <p>Your data is used solely for personalization, analytics, and improving our AI models.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Security</h4>
                  <p>All data is encrypted and stored securely. We never sell your personal information.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Rights</h4>
                  <p>You have the right to access, export, and delete your data at any time.</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => window.open('/api/terms-of-service', '_blank')}>
                View Full Terms of Service
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
