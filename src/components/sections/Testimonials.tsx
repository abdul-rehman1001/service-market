"use client";

import { ReactNode } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { motion, Variants } from "framer-motion";

// Updated Card component supporting className
interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default function Testimonials() {
  const reviews = [
    {
      text: "Finding a reliable plumber has never been easier. I posted a job and had three quotes within an hour. The AI matching is a game-changer!",
      name: "Alex R.",
      role: "Homeowner",
    },
    {
      text: "As a freelance designer, ServiceApp has filled my pipeline with quality leads. The management tools are intuitive and save me so much admin time.",
      name: "Jenna S.",
      role: "Graphic Designer",
    },
    {
      text: "The platform is so easy to use. I booked a house cleaner for my parents in another city. The process was secure and completely transparent.",
      name: "Mike T.",
      role: "Family Manager",
    },
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
      },
    }),
  };

  const quoteVariants: Variants = {
    float: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="py-16 bg-[#f5f7f8]">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Trusted by Thousands
        </h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          See what our users have to say about their experience.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            <Card className="relative hover:scale-105 transition-transform">
              {/* Animated quote icon */}
              <motion.div
                className="absolute -top-4 left-4 text-blue-400 text-4xl opacity-30"
                variants={quoteVariants}
                animate="float"
              >
                <FaQuoteLeft />
              </motion.div>

              {/* Stars */}
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm md:text-base mt-2">{review.text}</p>

              {/* Reviewer Info */}
              <div className="mt-4 md:mt-6">
                <h4 className="font-bold text-gray-900">{review.name}</h4>
                <p className="text-gray-500 text-sm">{review.role}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
