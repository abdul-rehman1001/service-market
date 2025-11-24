"use client";

import Slider from "react-slick";
import Image from "next/image";

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Find Quality Services",
    subtitle: "Connect with experts easily and efficiently.",
    image: "/images/service1.png",
  },
  {
    id: 2,
    title: "Offer Your Services",
    subtitle: "Grow your business and reach more clients.",
    image: "/images/service2.png",
  },
  {
    id: 3,
    title: "Smart & Simple",
    subtitle: "Manage and find services in one platform.",
    image: "/images/service3.png",
  },
];

export default function HeroCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Slider {...settings}>
        {carouselItems.map((item) => (
          <div key={item.id}>
            <div className="relative flex flex-col items-center justify-center bg-[#f5f7f8] rounded-xl p-8  min-h-[300px] md:min-h-[400px] transition-transform duration-500 hover:scale-105">
              <Image
                src={item.image}
                alt={item.title}
                width={500}
                height={300}
                className="rounded-lg object-cover mb-6 shadow-md"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
                {item.title}
              </h2>
              <p className="text-gray-600 text-center max-w-xl">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
