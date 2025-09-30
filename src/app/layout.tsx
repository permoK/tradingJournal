import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import ServerCompileLoader from "@/components/ServerCompileLoader";
import ClientOnly from "@/components/ClientOnly";
import SessionProvider from "@/components/SessionProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TradeModeProvider } from "@/contexts/TradeModeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ToastContainer from "@/components/notifications/Toast";

import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TradeFlow",
  description: "Master your trading journey with comprehensive progress tracking and analysis tools",
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${poppins.variable} antialiased`}
      >
        <SessionProvider>
          <AuthProvider>
            <TradeModeProvider>
              <NotificationProvider>
                <ClientOnly>
                  <ServerCompileLoader />
                </ClientOnly>
                {children}
                <ToastContainer />
              </NotificationProvider>
            </TradeModeProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
