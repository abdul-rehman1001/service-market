import ChartPlaceholder from "@/components/admin/Charts/ChartPlaceholder";

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartPlaceholder title="Booking Trends (Daily / Monthly)" />
      <ChartPlaceholder title="User Growth Over Time" />
    </div>
  );
}
