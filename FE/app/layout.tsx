import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ENS Social Graph",
  description: "Visualize and edit ENS connections",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster 
          position="bottom-center" 
          richColors 
          theme="light"
          closeButton
          className="font-sans"
          toastOptions={{
            style: {
                borderRadius: '12px',
                border: '1px solid var(--gray-200)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            },
            classNames: {
                toast: 'font-sans',
                title: 'text-sm font-semibold',
                description: 'text-xs text-gray-500'
            }
          }}
        />
      </body>
    </html>
  );
}
