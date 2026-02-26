'use client';

import { useEffect, useMemo, useState } from 'react';

interface CountdownTimerProps {
  target: string | Date | null;
  onExpire?: () => void;
}

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const CountdownTimer = ({ target, onExpire }: CountdownTimerProps) => {
  const targetTime = useMemo(() => {
    if (!target) return null;
    const value = typeof target === 'string' ? new Date(target) : target;
    return Number.isNaN(value.getTime()) ? null : value;
  }, [target]);

  const [remaining, setRemaining] = useState(() => {
    if (!targetTime) return 0;
    return targetTime.getTime() - Date.now();
  });

  useEffect(() => {
    if (!targetTime) return undefined;

    const interval = setInterval(() => {
      const nextRemaining = targetTime.getTime() - Date.now();
      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  if (!targetTime) {
    return <span>--:--</span>;
  }

  return <span>{formatRemaining(remaining)}</span>;
};
