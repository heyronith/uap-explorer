import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const shareTech = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UAP Explorer",
  description: "Explore the official UAP release archive with grounded RAG answers",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${shareTech.variable}`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
      </head>
      <body className="font-mono text-[16px] leading-relaxed tracking-wide sm:text-[17px]">
        {children}
      </body>
    </html>
  );
}
