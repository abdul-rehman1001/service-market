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
    subtitle: "Connect with verified professionals and get work done efficiently.",
    image: "/images/service1.png",
  },
  {
    id: 2,
    title: "Offer Your Services",
    subtitle: "Showcase your skills, attract clients, and grow your business.",
    image: "/images/service2.png",
  },
  {
    id: 3,
    title: "Smart & Simple Platform",
    subtitle: "Everything you need to manage and discover services in one place.",
    image: "/images/service3.png",
  },
];

export default function HeroCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: true,
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Slider {...settings}>
          {carouselItems.map((item) => (
            <div key={item.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-12 md:px-14">
                
                {/* Content */}
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                    {item.title}
                  </h1>

                  <p className="mt-4 text-slate-600 max-w-lg">
                    {item.subtitle}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-white font-medium transition">
                      Get Started
                    </button>
                    <button className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 bg-emerald-600 font-medium hover:bg-emerald-700 transition">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="flex justify-center md:justify-end">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={520}
                    height={360}
                    className="object-contain"
                    priority
                  />
                </div>

              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
