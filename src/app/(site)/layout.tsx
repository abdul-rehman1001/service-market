import Header from "@/components/layout/Header";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
