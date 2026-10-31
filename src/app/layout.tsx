import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PaidFlow — Freelancer Proposals, UPI Invoicing & Verified Trust',
  description: 'Clean modern fintech dashboard for solo freelancers to manage proposals, time tracking, UPI invoicing, and verified client trust scores.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a] selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

