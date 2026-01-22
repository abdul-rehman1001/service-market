'use client';

import { motion } from 'framer-motion';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function OtpInputGroup({ value, onChange }: Props) {
  const digits = value.split('');

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;

    const newValue =
      value.substring(0, index) + val + value.substring(index + 1);

    onChange(newValue);

    if (val && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input
          key={i}
          id={`otp-${i}`}
          type="text"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(e.target.value, i)}
          className="w-12 h-14 text-xl text-center border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
