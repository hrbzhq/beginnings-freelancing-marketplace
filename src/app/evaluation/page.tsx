'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';

interface Evaluation {
  id: string;
  periodStart: string;
  periodEnd: string;
  revenue: number;
  reportSales: number;
  subscriptions: number;
  dau: number;
  mau: number;
  ctrInsights: number | null;
  apiErrors: number;
  latencyMsP95: number | null;
  suggestions: any;
  appliedChanges: any;
  status: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function EvaluationDashboard() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningEvaluation, setRunningEvaluation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evalResponse, notifResponse] = await Promise.all([
        fetch('/api/evaluation'),
        fetch('/api/notifications')
      ]);

      const evalData = await evalResponse.json();
      const notifData = await notifResponse.json();

      setEvaluations(evalData);
      setNotifications(notifData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    setRunningEvaluation(true);
    try {
      const response = await fetch('/api/evaluation/trigger', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Evaluation started! Check back in a few minutes for results.');
        loadData(); // Refresh data
      } else {
        alert('Failed to start evaluation');
      }
    } catch (error) {
      console.error('Failed to trigger evaluation:', error);
      alert('Failed to start evaluation');
    } finally {
      setRunningEvaluation(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluation data...</p>
        </div>
      </div>
    );
  }

  const latestEvaluation = evaluations[0];
  const unreadNotifications = notifications.filter(n => n.status === 'unread');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Evaluation Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Automated weekly analysis and optimization suggestions
          </p>
        </div>
        <Button
          onClick={runEvaluation}
          disabled={runningEvaluation}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {runningEvaluation ? 'Running...' : 'Run Evaluation'}
        </Button>
      </div>

      {/* Key Metrics */}
      {latestEvaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(latestEvaluation.revenue)}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestEvaluation.dau}</div>
              <p className="text-xs text-muted-foreground">
                Daily active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Report Sales</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestEvaluation.reportSales}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestEvaluation.apiErrors}</div>
              <p className="text-xs text-muted-foreground">
                Errors this week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="evaluations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Evaluation Report
                    </CardTitle>
                    <CardDescription>
                      {formatDate(evaluation.periodStart)} - {formatDate(evaluation.periodEnd)}
                    </CardDescription>
                  </div>
                  <Badge variant={evaluation.status === 'applied' ? 'default' : 'secondary'}>
                    {evaluation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium ml-2">{formatCurrency(evaluation.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DAU:</span>
                    <span className="font-medium ml-2">{evaluation.dau}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reports:</span>
                    <span className="font-medium ml-2">{evaluation.reportSales}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="font-medium ml-2">{evaluation.apiErrors}</span>
                  </div>
                </div>

                {evaluation.suggestions && (
                  <div className="space-y-3">
                    <h4 className="font-medium">AI Suggestions</h4>

                    {evaluation.suggestions.promptSuggestions?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground">Prompt Optimizations</h5>
                        <ul className="text-sm space-y-1 mt-1">
                          {evaluation.suggestions.promptSuggestions.map((suggestion: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion.name}: {suggestion.reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.suggestions.reportIdeas?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground">New Report Ideas</h5>
                        <ul className="text-sm space-y-1 mt-1">
                          {evaluation.suggestions.reportIdeas.map((idea: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{idea.title} ({idea.category}) - Demand: {idea.estimatedDemand}/10</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.suggestions.riskAlerts?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground">Risk Alerts</h5>
                        <ul className="text-sm space-y-1 mt-1">
                          {evaluation.suggestions.riskAlerts.map((alert: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                alert.severity === 'critical' ? 'text-red-500' :
                                alert.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                              }`} />
                              <span>{alert.type}: {alert.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {evaluation.appliedChanges && Object.keys(evaluation.appliedChanges).length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-green-700">Auto-Applied Changes</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      {evaluation.appliedChanges.promptUpdates?.map((update: any, index: number) => (
                        <li key={index} className="text-green-600">
                          ✓ Updated {update.name}: {update.reason}
                        </li>
                      ))}
                      {evaluation.appliedChanges.weightAdjustments && (
                        <li className="text-green-600">
                          ✓ Updated recommendation weights
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.map((notification) => (
            <Alert key={notification.id} className={
              notification.priority === 'critical' ? 'border-red-500' :
              notification.priority === 'high' ? 'border-orange-500' : ''
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {notification.title}
                <Badge variant={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                {notification.message}
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.createdAt)}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Insights</CardTitle>
              <CardDescription>
                Real-time analysis and automated improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <h3 className="font-medium">Prompt Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    AI continuously improves response quality
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <h3 className="font-medium">Performance Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time metrics and automated alerts
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <h3 className="font-medium">Revenue Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Data-driven business improvements
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">System Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI Models Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Queue Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Notifications Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Next Evaluation: Mon 9AM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
