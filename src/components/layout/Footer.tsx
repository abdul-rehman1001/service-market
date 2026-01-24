"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-white text-2xl font-bold">Servizo</h2>
            <p className="mt-3 text-gray-400 text-sm">
              Find trusted service providers for your daily needs.
            </p>

            {/* Social Icons */}
            <div className="flex items-center mt-4 gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-500 hover:scale-110 transition transform"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-emerald-500 cursor-pointer transition">Home Cleaning</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Plumbing</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Shifting Service</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Electrician</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-emerald-500 cursor-pointer transition">About Us</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Contact</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Terms & Conditions</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-emerald-500 cursor-pointer transition">Help Center</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">FAQs</li>
              <li className="hover:text-emerald-500 cursor-pointer transition">Report a Problem</li>
            </ul>

            {/* Contact Info */}
            <div className="mt-4 space-y-1 text-sm text-gray-400">
              <p className="flex items-center gap-2 hover:text-emerald-400 transition">
                <FaEnvelope className="w-4 h-4" /> support@servizo.com
              </p>
              <p className="flex items-center gap-2 hover:text-emerald-400 transition">
                <FaPhoneAlt className="w-4 h-4" /> +1 234 567 890
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-10 pt-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Servizo — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
