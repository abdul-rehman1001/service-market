import ProvidersTable from "@/components/admin/tables/ProvidersTable";

export default function AdminProvidersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Provider Verification</h2>
        <p className="text-slate-600">Review and verify service providers</p>
      </div>

      <ProvidersTable />
    </section>
  );
}