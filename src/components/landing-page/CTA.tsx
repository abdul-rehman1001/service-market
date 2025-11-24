"use client";

import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="py-20 bg-[#f5f7f8]">
      <div className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-12 md:p-16 shadow-sm">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Ready to Get Started?
        </h2>

        <p className="text-gray-600 mt-4 md:mt-6 max-w-2xl mx-auto text-sm md:text-base">
          Join our community today. Whether you are looking for help or aiming to grow your business, your journey starts here.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button 
           href="/register/seeker"
          className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto">
            Find a Service Now
          </Button>

          <Button 
           href="/register/provider"
          className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto">
            Become a Provider
          </Button>
        </div>
      </div>
    </section>
  );
}
