"use client";

export default function Footer() {
  return (
    <footer className="bg-[#f5f7f8] border-t mt-16 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo / Brand */}
        <div className="text-blue-600 font-bold text-lg md:text-xl">ServiceApp</div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          <a href="#" className="hover:text-blue-600 transition-colors">FAQ</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-sm mt-4 md:mt-0 text-center md:text-left">
          © {new Date().getFullYear()} ServiceApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
