'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle, Eye, FileText, Calendar, User } from 'lucide-react';

interface ReportDraft {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDemand: number;
  targetAudience: string;
  keyInsights: string[];
  dataSources: string[];
  content: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  createdBy: 'system' | 'human';
  evaluationId?: string;
  createdAt: string;
  evaluation?: {
    periodStart: string;
    periodEnd: string;
  };
}

export default function ReportDraftsPage() {
  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<ReportDraft | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/report-drafts');
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDraftStatus = async (draftId: string, status: string) => {
    try {
      const response = await fetch(`/api/report-drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchDrafts();
      }
    } catch (error) {
      console.error('Failed to update draft:', error);
    }
  };

  const publishDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/report-drafts/${draftId}/publish`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchDrafts();
      }
    } catch (error) {
      console.error('Failed to publish draft:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const draftsByStatus = drafts.reduce((acc, draft) => {
    if (!acc[draft.status]) acc[draft.status] = [];
    acc[draft.status].push(draft);
    return acc;
  }, {} as Record<string, ReportDraft[]>);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading drafts...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Report Draft Review</h1>
        <p className="text-gray-600">Review and manage AI-generated report drafts</p>
      </div>

      {showDetail && selectedDraft && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedDraft.title}</CardTitle>
                <CardDescription>{selectedDraft.description}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><strong>Category:</strong> {selectedDraft.category}</div>
              <div><strong>Demand:</strong> {selectedDraft.estimatedDemand}/10</div>
              <div><strong>Created by:</strong> {selectedDraft.createdBy}</div>
              <div><strong>Target:</strong> {selectedDraft.targetAudience}</div>
            </div>

            {selectedDraft.keyInsights && selectedDraft.keyInsights.length > 0 && (
              <div className="mb-4">
                <strong>Key Insights:</strong>
                <ul className="list-disc list-inside mt-2">
                  {selectedDraft.keyInsights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <strong>Content:</strong>
              <div className="mt-2 p-4 bg-gray-50 rounded max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{selectedDraft.content}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="draft">Drafts ({draftsByStatus.draft?.length || 0})</TabsTrigger>
          <TabsTrigger value="review">In Review ({draftsByStatus.review?.length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({draftsByStatus.approved?.length || 0})</TabsTrigger>
          <TabsTrigger value="published">Published ({draftsByStatus.published?.length || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({draftsByStatus.rejected?.length || 0})</TabsTrigger>
        </TabsList>

        {['draft', 'review', 'approved', 'published', 'rejected'].map(status => (
          <TabsContent key={status} value={status}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(draftsByStatus[status] || []).map(draft => (
                <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg mb-2">{draft.title}</CardTitle>
                        <Badge className={getStatusColor(draft.status)}>
                          {draft.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDraft(draft);
                            setShowDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateDraftStatus(draft.id, 'review')}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}

                        {status === 'review' && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDraftStatus(draft.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateDraftStatus(draft.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {status === 'approved' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => publishDraft(draft.id)}
                          >
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{draft.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(draft.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {draft.createdBy}
                      </div>
                    </div>
                    {draft.evaluation && (
                      <div className="mt-2 text-xs text-gray-500">
                        Evaluation: {new Date(draft.evaluation.periodStart).toLocaleDateString()} - {new Date(draft.evaluation.periodEnd).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {(draftsByStatus[status] || []).length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No {status} drafts found</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
