export default function PopularCategories() {
  const categories = [
    "Home Cleaning",
    "Electrician",
    "Plumbing",
    "AC Repair",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold mb-4">Most Popular Categories</h3>
      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c} className="flex justify-between">
            <span>{c}</span>
            <span className="text-emerald-600 font-medium">+12%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
