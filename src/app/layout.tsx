import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Utility Box",
  description:
    "Streamline your workflow with practical and efficient utilities. Focus on coding and building.",
  icons: {
    icon: "/logo4.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
