import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";



const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

export const metadata: Metadata = {
  title: "Sedge - AI Financial Copilot",
  description: "The AI Financial Copilot for On-Chain Finance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${hanken.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      </head>
      <body className="bg-background font-body-md text-on-background antialiased min-h-screen">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
