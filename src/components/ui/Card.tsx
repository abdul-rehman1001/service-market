export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border">
      {children}
    </div>
  );
}
