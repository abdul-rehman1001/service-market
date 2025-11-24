// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Redirect the root URL `/` to `/landing`
  redirect("/landing");
}
