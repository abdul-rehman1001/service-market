export default function LoginLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-gray-300 rounded-lg"></div>

          {/* Links skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
