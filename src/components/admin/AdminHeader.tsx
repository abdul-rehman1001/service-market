export const AdminHeader = () => (
  <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
    <input className="border px-4 py-2 rounded-lg" placeholder="Search..." />
    <div className="flex items-center gap-4">
      <button>🔔</button>
      <div className="w-9 h-9 rounded-full bg-gray-300" />
    </div>
  </header>
);
