"use client";

import { ReactNode } from "react";
import { FaShieldAlt, FaBolt, FaUsers, FaTools } from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import { cn } from "../../lib/utils"; // Tailwind class merge helper

// Updated Card component supporting className
interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg p-6", className)}>
      {children}
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <FaBolt className="text-white text-3xl" />,
      title: "AI-Powered Matching",
      description: "Our AI connects you with the perfect provider within seconds.",
      bg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    },
    {
      icon: <FaShieldAlt className="text-white text-3xl" />,
      title: "Verified Providers",
      description: "Every provider is vetted for quality and reliability.",
      bg: "bg-gradient-to-br from-green-400 to-teal-500",
    },
    {
      icon: <FaTools className="text-white text-3xl" />,
      title: "Easy Booking",
      description: "Easily book services in just a few clicks.",
      bg: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: <FaUsers className="text-white text-3xl" />,
      title: "Simple Management",
      description: "Manage bookings and schedules easily.",
      bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
    },
  ];

  // Framer Motion variants (TypeScript-safe)
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        type: "spring" as const, // Type-safe literal
        stiffness: 120,
        damping: 20,
      },
    }),
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Everything You Need, All in One Place
        </h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Discover features that make finding and providing services easier.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            <Card
              className={`flex flex-col items-center text-center p-6 rounded-xl ${feature.bg} transform transition duration-500 hover:scale-105 hover:shadow-xl`}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4 bg-white/20">
                {feature.icon}
              </div>
              <h3 className="font-bold text-white text-xl mt-2">{feature.title}</h3>
              <p className="text-white/90 text-sm mt-2">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
