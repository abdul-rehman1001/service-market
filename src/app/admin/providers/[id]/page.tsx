export default function ProviderReviewPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Provider Verification Review</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Provider Details</h3>
          <p><strong>Name:</strong> Ahmed Electric</p>
          <p><strong>Email:</strong> ahmed@provider.com</p>
          <p><strong>Business Type:</strong> Electrician</p>
          <p><strong>Submitted:</strong> 10 Feb 2025</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Documents</h3>
          <ul className="space-y-2">
            <li className="text-emerald-600 underline cursor-pointer">View CNIC</li>
            <li className="text-emerald-600 underline cursor-pointer">View Certification</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Admin Decision</h3>
        <textarea
          placeholder="Reason for rejection (if any)"
          className="w-full border rounded-md px-3 py-2"
        />

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-md bg-emerald-600 text-white">
            Approve
          </button>
          <button className="px-4 py-2 rounded-md bg-red-600 text-white">
            Reject
          </button>
        </div>
      </div>
    </section>
  );
}
