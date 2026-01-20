interface SearchMapProps {
  location: string;
}

export default function SearchMap({ location }: SearchMapProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-50">
      {/* Placeholder Map - Replace with actual map library like Mapbox or Google Maps */}
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Water/Ocean background */}
          <rect width="400" height="600" fill="#87CEEB" />
          
          {/* Land areas */}
          <path
            d="M 200 100 Q 250 120 280 150 L 320 140 L 340 180 Q 350 200 340 220 L 300 240 L 280 260 Q 250 280 220 290 L 200 300 Q 180 290 150 280 L 120 260 Q 100 240 90 220 L 100 180 Q 110 150 140 130 Z"
            fill="#C8E6C9"
          />

          {/* Water body on right */}
          <path
            d="M 320 140 Q 360 160 380 200 L 400 300 L 320 260 Z"
            fill="#5BA3D0"
          />

          {/* Park/Green area */}
          <circle cx="150" cy="200" r="30" fill="#81C784" opacity="0.6" />
          
          {/* Bridge indicator */}
          <line x1="200" y1="180" x2="220" y2="160" stroke="#FFA500" strokeWidth="2" />
          
          {/* Location labels */}
          <text x="180" y="480" fontSize="24" fontWeight="bold" fill="#333">
            {location}
          </text>

          {/* Landmark labels */}
          <text x="280" y="140" fontSize="12" fill="#666" fontWeight="500">
            Golden Gate
          </text>
          <text x="280" y="155" fontSize="12" fill="#666" fontWeight="500">
            Bridge
          </text>

          <text x="160" y="320" fontSize="11" fill="#666">
            Twin Peaks
          </text>

          <text x="120" y="420" fontSize="11" fill="#666">
            Mission District
          </text>

          {/* Provider pin */}
          <circle cx="200" cy="220" r="8" fill="#059669" stroke="white" strokeWidth="2" />
          <circle cx="200" cy="220" r="14" fill="none" stroke="#059669" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Map overlay info */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
        <p className="text-sm font-semibold text-gray-800">{location}</p>
        <p className="text-xs text-gray-600">Zoom & pan to explore</p>
      </div>
    </div>
  );
}