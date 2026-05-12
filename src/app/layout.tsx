import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Cards",
  description: "Create movie & TV show cards to share",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/icons/icon-192.svg", type: "image/svg+xml" },
  ]
};

export const viewport: Viewport = {
  themeColor: "#010101",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_#1c1917_0%,_#0a0a0a_50%,_#000000_100%)]">
        {children}
        <Footer />
        <PwaRegister />
      </body>
    </html>
  );
}
