import { Header } from "@/components/Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReduxProvider } from "@/redux/reduxProvider";
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
  title: "Peppa in 52 Days",
  description: "Memorize Peppa Pig in 52 Days",
  icons: {
    icon: "/favicon.png",
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
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "flex min-h-screen w-full flex-col items-center bg-hero-bg bg-cover bg-center bg-no-repeat",
        )}
      >
        <ReduxProvider>
          <TooltipProvider>
            <Header />
            <div className="w-full lg:max-w-7xl lg:p-10">{children}</div>
          </TooltipProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
