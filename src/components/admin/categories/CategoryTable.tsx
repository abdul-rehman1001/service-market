import CategoryRow from "./CategoryRow";

const categories: Array<{
  id: string;
  name: string;
  parent: string;
  status: "Active" | "Inactive";
}> = [
  { id: "1", name: "Home Services", parent: "-", status: "Active" },
  { id: "2", name: "Plumbing", parent: "Home Services", status: "Active" },
  { id: "3", name: "Electrician", parent: "Home Services", status: "Inactive" },
];

export default function CategoryTable() {
  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Parent</th>
            <th className="text-left p-3">Status</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
