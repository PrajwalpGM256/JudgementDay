import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JudgmentDay - NFL Prediction Platform",
  description: "Make your NFL predictions with confidence points. Compete in leagues, track your accuracy, and face judgment day every Sunday.",
  keywords: ["NFL", "predictions", "fantasy", "football", "picks", "confidence", "leagues"],
  authors: [{ name: "JudgmentDay Team" }],
  creator: "JudgmentDay",
  publisher: "JudgmentDay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://judgmentday.app"),
  openGraph: {
    title: "JudgmentDay - NFL Prediction Platform",
    description: "Make your NFL predictions with confidence points. Compete in leagues, track your accuracy, and face judgment day every Sunday.",
    url: "https://judgmentday.app",
    siteName: "JudgmentDay",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JudgmentDay - NFL Prediction Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JudgmentDay - NFL Prediction Platform",
    description: "Make your NFL predictions with confidence points. Compete in leagues, track your accuracy, and face judgment day every Sunday.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
