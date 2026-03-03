"use client";

import { use } from "react";
import ServiceDetails from "@/components/admin/services/ServiceDetails";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="max-w-6xl">
      <ServiceDetails serviceId={id} />
    </div>
  );
}
