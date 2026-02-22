/**
 * Root Layout — wraps all pages
 *
 * Responsibilities:
 * - Sets <html> and <body> tags
 * - Loads global CSS (Tailwind + Inter font)
 * - Provides consistent page structure
 * - Sets metadata for SEO and tab title
 */

import "@/styles/globals.css";

// Next.js metadata — shown in browser tab and search results
export const metadata = {
  title: "Client Reporting Dashboard",
  description: "White-label client reporting dashboard powered by GoHighLevel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply Inter font and smooth scrolling to the entire app */}
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
