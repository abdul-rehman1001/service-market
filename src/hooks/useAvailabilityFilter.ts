'use client';

import { useCallback, useState } from 'react';

export type AvailabilityCheckProvider = {
  providerId: string;
  serviceId: string;
};

export type AppliedAvailabilityFilter = {
  date: string;
  time: string;
};

export function useAvailabilityFilter() {
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [applied, setApplied] = useState<AppliedAvailabilityFilter | null>(null);
  const [availableIds, setAvailableIds] = useState<Set<string> | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setDraftDate('');
    setDraftTime('');
    setApplied(null);
    setAvailableIds(null);
    setError(null);
    setChecking(false);
  }, []);

  const apply = useCallback((): AppliedAvailabilityFilter | null => {
    if (!draftDate || !draftTime) {
      setError('Please select both date and time.');
      return null;
    }
    const next = { date: draftDate, time: draftTime };
    setApplied(next);
    setError(null);
    return next;
  }, [draftDate, draftTime]);

  const runCheck = useCallback(
    async (
      providers: AvailabilityCheckProvider[],
      filterOverride?: AppliedAvailabilityFilter | null
    ) => {
      const filter = filterOverride ?? applied;
      if (!filter) {
        setAvailableIds(null);
        return;
      }

      if (!providers.length) {
        setAvailableIds(new Set());
        return;
      }

      setChecking(true);
      setError(null);

      try {
        const response = await fetch('/api/providers/availability-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: filter.date,
            time: filter.time,
            providers,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check availability');
        }

        setAvailableIds(new Set(data.availableProviderIds || []));
      } catch (err) {
        console.error('Availability filter error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to check availability'
        );
        setAvailableIds(new Set());
      } finally {
        setChecking(false);
      }
    },
    [applied]
  );

  const filterByAvailability = useCallback(
    <T extends { id: string }>(providers: T[]): T[] => {
      if (!applied || availableIds === null) {
        return providers;
      }
      return providers.filter((p) => availableIds.has(p.id));
    },
    [applied, availableIds]
  );

  return {
    draftDate,
    setDraftDate,
    draftTime,
    setDraftTime,
    applied,
    availableIds,
    checking,
    error,
    isActive: Boolean(applied),
    apply,
    clear,
    runCheck,
    filterByAvailability,
  };
}
