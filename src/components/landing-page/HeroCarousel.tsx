"use client";

import Slider from "react-slick";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  btnClass: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Find Quality Services",
    subtitle:
      "Connect with verified professionals and get work done efficiently.",
    image: "/images/service1.png",
    accent: "from-emerald-600 to-teal-500",
    btnClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    id: 2,
    title: "Offer Your Services",
    subtitle:
      "Showcase your skills, attract clients, and grow your business.",
    image: "/images/service2.png",
    accent: "from-blue-600 to-indigo-500",
    btnClass: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: 3,
    title: "Smart & Simple Platform",
    subtitle:
      "Everything you need to manage and discover services in one place.",
    image: "/images/service3.png",
    accent: "from-emerald-500 to-cyan-500",
    btnClass: "bg-emerald-600 hover:bg-emerald-700",
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
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50/40 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Slider {...settings}>
          {carouselItems.map((item) => (
            <div key={item.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 shadow-lg px-8 py-12 md:px-14 md:py-16 transition-all duration-500 hover:shadow-xl">
                {/* Content */}
                <div className="text-center md:text-left">
                  <div
                    className={`inline-block w-12 h-1 rounded-full bg-gradient-to-r ${item.accent} mb-6`}
                  />
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h2>

                  <p className="mt-4 text-gray-500 max-w-lg text-base md:text-lg leading-relaxed">
                    {item.subtitle}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      className={`group px-7 py-3 rounded-xl ${item.btnClass} text-white font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                    >
                      Get Started
                      <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="px-7 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative">
                    <div
                      className={`absolute -inset-4 bg-gradient-to-r ${item.accent} rounded-3xl opacity-10 blur-2xl`}
                    />
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={520}
                      height={360}
                      className="relative object-contain drop-shadow-lg"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
