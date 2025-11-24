"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export default function Input({ icon, ...props }: InputProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
      {icon}
      <input
        {...props}
        className="bg-transparent w-full outline-none text-gray-700"
      />
    </div>
  );
}
