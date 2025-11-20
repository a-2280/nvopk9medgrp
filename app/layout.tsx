import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import TopBanner from "@/components/TopBanner";

export const metadata: Metadata = {
  title: "Nevada Operational Canine Medical Group",
  description:
    "Nevada Operational Canine Medical Group provides life-saving medical training, equipment, and emergency protocols for police, military, and SAR K9 units.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className=" no-scrollbar no-scrollbar"
    >
      <body className="antiallias overflow-x-hidden">
        <TopBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
