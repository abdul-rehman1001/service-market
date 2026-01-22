'use client';

interface PortfolioItemProps {
  image: string;
  description: string;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({ image, description }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <img src={image} alt="Portfolio" className="w-full h-40 object-cover" />
      <div className="p-2 text-sm text-gray-700">{description}</div>
    </div>
  );
};
