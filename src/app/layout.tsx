import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import ServerCompileLoader from "@/components/ServerCompileLoader";
import ClientOnly from "@/components/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";
import { TradeModeProvider } from "@/contexts/TradeModeContext";

import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TradeFlow",
  description: "Master your trading journey with comprehensive progress tracking and community collaboration",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider>
          <TradeModeProvider>
            <ClientOnly>
              <ServerCompileLoader />
            </ClientOnly>
            {children}
          </TradeModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
