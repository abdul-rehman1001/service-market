// src/app/layout.tsx
import "./globals.css";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f5f7f8] text-gray-800">
     
        <main className="flex-1">
          {children}
        </main>
        
      </body>
    </html>
  );
}
