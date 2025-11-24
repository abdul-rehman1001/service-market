import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  href?: string; // <-- added
}

export default function Button({ children, className, href, ...props }: ButtonProps) {
  if (href) {
    // Render as Link if href exists
    return (
      <Link
        href={href}
        className={cn(
          "px-5 py-2 rounded-lg font-medium transition inline-block",
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
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
