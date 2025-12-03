// app/components/layout/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <h2 className="text-white text-xl font-semibold">ServiceMarket</h2>
            <p className="mt-3 text-sm text-gray-400">
              Find trusted service providers for your daily needs.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-medium mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>Home Cleaning</li>
              <li>Plumbing</li>
              <li>Shifting Service</li>
              <li>Electrician</li>
              <li>Painting</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-medium mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-medium mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>Help Center</li>
              <li>FAQs</li>
              <li>Report a Problem</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-10 pt-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ServiceMarket — All rights reserved.
        </div>

      </div>
    </footer>
  );
}
