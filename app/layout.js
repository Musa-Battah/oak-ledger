import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Oak Ledger - Double-Entry Bookkeeping System',
  description: 'Professional double-entry accounting system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}