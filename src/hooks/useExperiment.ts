'use client';

import { useState, useEffect } from 'react';

interface ExperimentVariant {
  experimentId: string;
  variantId: string;
  content: any;
}

interface UseExperimentOptions {
  userId?: string;
  enabled?: boolean;
}

export function useExperiment(
  experimentId: string,
  options: UseExperimentOptions = {}
) {
  const { userId, enabled = true } = options;
  const [variant, setVariant] = useState<ExperimentVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !experimentId) {
      setLoading(false);
      return;
    }

    const fetchVariant = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) {
          params.append('userId', userId);
        }

        const response = await fetch(`/api/experiments/${experimentId}?${params}`);
        if (response.ok) {
          const data = await response.json();
          setVariant(data);
        } else {
          setError('Failed to fetch experiment variant');
        }
      } catch (err) {
        setError('Error fetching experiment variant');
        console.error('Experiment fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVariant();
  }, [experimentId, userId, enabled]);

  const trackEvent = async (eventType: string, metadata?: any) => {
    if (!variant || !userId) return;

    try {
      await fetch(`/api/experiments/${experimentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          variantId: variant.variantId,
          eventType,
          metadata
        }),
      });
    } catch (error) {
      console.error('Error tracking experiment event:', error);
    }
  };

  return {
    variant,
    loading,
    error,
    trackEvent
  };
}

// Hook for tracking conversion events
export function useExperimentTracking(experimentId: string, userId?: string) {
  const trackConversion = (eventType: string, metadata?: any) => {
    if (!userId) return;

    fetch(`/api/experiments/${experimentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        variantId: 'unknown', // Will be determined server-side if needed
        eventType,
        metadata
      }),
    }).catch(error => {
      console.error('Error tracking conversion:', error);
    });
  };

  return { trackConversion };
}
