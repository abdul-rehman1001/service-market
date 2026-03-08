// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Direct redirect to landing page
  redirect("/landing");
}

// Optimize page metadata for faster loading
export const metadata = {
  title: 'Servizo - Service Marketplace',
  description: 'Find verified service providers near you',
};
