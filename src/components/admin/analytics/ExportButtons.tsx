export default function ExportButtons() {
  return (
    <div className="flex gap-4">
      <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
        Export CSV
      </button>
      <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
        Export PDF
      </button>
    </div>
  );
}
