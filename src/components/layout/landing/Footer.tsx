"use client";

import { HiSparkles } from "react-icons/hi2";

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <HiSparkles className="text-white text-sm" />
              </div>
              <span className="text-xl font-extrabold text-white">Servizo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The smart way to find and offer services. Connecting professionals with those who need them.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Find Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Become a Provider</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Servizo. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            Made with <span className="text-emerald-500 mx-0.5">♥</span> for service providers & seekers
          </div>
        </div>
      </div>
    </footer>
  );
}
