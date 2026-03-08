import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  href?: string;
  prefetch?: boolean;
}

export default function Button({ 
  children, 
  className, 
  href, 
  prefetch = true,
  ...props 
}: ButtonProps) {
  if (href) {
    // Render as optimized Link with prefetching enabled
    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={cn(
          "px-5 py-2 rounded-lg font-medium transition inline-block cursor-pointer",
          "hover:opacity-90 active:scale-[0.98] transform",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  // Otherwise render as normal button
  return (
    <button
      className={cn(
        "px-5 py-2 rounded-lg font-medium transition",
        "hover:opacity-90 active:scale-[0.98] transform disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
