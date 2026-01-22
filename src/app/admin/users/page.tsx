import UsersTable from "@/components/admin/tables/UsersTable";
import UserFilters from "@/components/admin/filters/UserFilters";


export default function AdminUsersPage() {
return (
<section className="space-y-6">
<div>
<h2 className="text-2xl font-semibold">User Management</h2>
<p className="text-slate-600">Manage seekers and service providers</p>
</div>


<UserFilters />
<UsersTable />
</section>
);
}