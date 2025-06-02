import { ThemeBootstrapper } from "@/components/ThemeBootstrapper";
import { Toaster } from "@/components/ui/Sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Dev Utility Box",
  description:
    "Agilize seu fluxo de trabalho com utilitários práticos e eficientes. Foque em codificar e construir.",
  icons: {
    icon: "/logo4.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeBootstrapper />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
