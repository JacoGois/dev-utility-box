import { ThemeBootstrapper } from "@/components/ThemeBootstrapper";
import { Toaster } from "@/components/ui/Sonner";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const messages = await import(`@/i18n/messages/${locale}.json`).then(
    (module) => module.default
  );

  return {
    title: "Dev Utility Box",
    description: messages.desktop.description,
    icons: {
      icon: "/logo4.png",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await import(`@/i18n/messages/${locale}.json`).then(
    (module) => module.default
  );

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeBootstrapper />
          <Toaster />
          <Analytics />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
