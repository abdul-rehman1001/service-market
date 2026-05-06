"use client";

import Link from "next/link";
import {
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Sections */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-white text-2xl font-bold">Servizo</h2>
            <p className="mt-3 text-gray-400 text-sm">
              Find trusted service providers, compare options, and book with confidence across Pakistan.
            </p>

            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2 hover:text-emerald-400 transition">
                <FaEnvelope className="w-4 h-4" /> support@servizo.com
              </p>
              <p className="flex items-center gap-2 hover:text-emerald-400 transition">
                <FaPhoneAlt className="w-4 h-4" /> +1 234 567 890
              </p>
            </div>

          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/home" className="transition hover:text-emerald-500">Home</Link></li>
              <li><Link href="/services" className="transition hover:text-emerald-500">Services</Link></li>
              <li><Link href="/bookings" className="transition hover:text-emerald-500">My Bookings</Link></li>
              <li><Link href="/messages" className="transition hover:text-emerald-500">Messages</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="transition hover:text-emerald-500">About Us</Link></li>
              <li><Link href="/faq" className="transition hover:text-emerald-500">FAQs</Link></li>
              <li><Link href="/privacy" className="transition hover:text-emerald-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-emerald-500">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="transition hover:text-emerald-500">Login</Link></li>
              <li><Link href="/register" className="transition hover:text-emerald-500">Create Account</Link></li>
              <li><Link href="/register/provider" className="transition hover:text-emerald-500">Become a Provider</Link></li>
              <li><Link href="/register/seeker" className="transition hover:text-emerald-500">Find Services</Link></li>
            </ul>
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
