'use client';

export const AnalyticsPanel: React.FC = () => {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          Analytics Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Job completion trends, ratings, busiest hours, and exportable reports
        </p>
      </div>

      {/* Content Card */}
      <div
        className="
          bg-white rounded-xl border border-slate-200
          p-6 shadow-sm
          transition-all duration-300 ease-out
          hover:shadow-md
        "
      >
        <div className="space-y-3">
          <p className="text-slate-700 text-sm leading-relaxed">
            Monitor your performance metrics including job completion trends,
            customer ratings, peak working hours, and historical insights.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium transition hover:bg-emerald-100">
              Completion Trends
            </div>
            <div className="px-4 py-2 rounded-lg bg-sky-50 text-sky-700 text-sm font-medium transition hover:bg-sky-100">
              Ratings & Feedback
            </div>
            <div className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium transition hover:bg-amber-100">
              Peak Hours
            </div>
            <div className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium transition hover:bg-slate-200">
              Export Reports (PDF)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
