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

import { headers } from "next/headers";
import NotificationProvider from "@/providers/NotificationProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const initialState = headerList.get('cookie') || '';

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.variable} ${hanken.variable} antialiased bg-background text-on-background min-h-screen transition-colors duration-200`}>
        <SettingsProvider>
          <Web3Provider cookie={initialState}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </Web3Provider>
        </SettingsProvider>
      </body>
    </html>
  );
}
