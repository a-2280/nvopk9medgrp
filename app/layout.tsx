import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antiallias">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
