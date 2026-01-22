'use client';

import { useEffect, useState } from 'react';

export default function OtpTimer() {
  const [time, setTime] = useState(300); // 5 minutes

  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="text-center mt-4 text-sm">
      {time > 0 ? (
        <p className="text-gray-500">
          Resend OTP in{' '}
          <span className="text-emerald-600 font-medium">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
      ) : (
        <button className="text-emerald-600 font-medium hover:underline">
          Resend OTP
        </button>
      )}
    </div>
  );
}
