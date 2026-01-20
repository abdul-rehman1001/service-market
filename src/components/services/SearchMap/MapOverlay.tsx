interface Props {
  location: string;
}

export default function MapOverlay({ location }: Props) {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-3">
      <p className="text-sm font-semibold">{location}</p>
      <p className="text-xs text-gray-600">Zoom & pan to explore</p>
    </div>
  );
}
