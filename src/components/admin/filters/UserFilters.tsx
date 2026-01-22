"use client";


export default function UserFilters() {
return (
<div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
<input
placeholder="Search name, email, phone"
className="border rounded-md px-3 py-2"
/>


<select className="border rounded-md px-3 py-2">
<option>All Roles</option>
<option>Seeker</option>
<option>Provider</option>
</select>


<select className="border rounded-md px-3 py-2">
<option>All Status</option>
<option>Active</option>
<option>Suspended</option>
</select>


<select className="border rounded-md px-3 py-2">
<option>Verification</option>
<option>Verified</option>
<option>Pending</option>
<option>Rejected</option>
</select>
</div>
);
}