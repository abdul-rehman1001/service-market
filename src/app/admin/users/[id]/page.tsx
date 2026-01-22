export default function UserDetailsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold">User Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <p><strong>Name:</strong> Ali Khan</p>
        <p><strong>Email:</strong> ali@mail.com</p>
        <p><strong>Role:</strong> Provider</p>
        <p><strong>Status:</strong> Active</p>
        <p><strong>Verification:</strong> Pending</p>
        <p><strong>Joined:</strong> 12 Jan 2025</p>
      </div>

      <button className="px-4 py-2 rounded-md bg-red-600 text-white">
        Permanently Delete User
      </button>
    </div>
  );
}
