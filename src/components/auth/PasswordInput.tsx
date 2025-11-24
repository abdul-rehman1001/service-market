"use client";

import { useState, ReactNode, InputHTMLAttributes } from "react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export default function PasswordInput({ icon, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
      {icon}
      <input
        type={show ? "text" : "password"}
        className="bg-transparent w-full outline-none text-gray-700"
        {...props}
      />
      <button type="button" onClick={() => setShow((prev) => !prev)}>
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
