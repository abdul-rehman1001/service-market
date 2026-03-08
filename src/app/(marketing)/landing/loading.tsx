export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              <div className="h-16 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="flex gap-4">
                <div className="h-14 bg-gray-300 rounded-2xl w-40"></div>
                <div className="h-14 bg-gray-200 rounded-2xl w-40"></div>
              </div>
            </div>
            <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
