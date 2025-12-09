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
    <footer className="bg-[#1f2937] text-gray-300 py-16 mt-16">
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
            <div className="flex items-center mt-4 gap-4">
              <a href="#" className="bg-[#009966] text-white p-2 rounded-full hover:opacity-80 transition">
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a href="#" className="bg-[#009966] text-white p-2 rounded-full hover:opacity-80 transition">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="bg-[#009966] text-white p-2 rounded-full hover:opacity-80 transition">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="bg-[#009966] text-white p-2 rounded-full hover:opacity-80 transition">
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>Home Cleaning</li>
              <li>Plumbing</li>
              <li>Shifting Service</li>
              <li>Electrician</li>
             
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>Help Center</li>
              <li>FAQs</li>
              <li>Report a Problem</li>
            </ul>

            {/* Contact Info */}
            <div className="mt-4 space-y-1 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <FaEnvelope className="w-4 h-4" /> support@servizo.com
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt className="w-4 h-4" /> +1 234 567 890
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-10 pt-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Servizo — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
