import { Header } from "@/components/Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReduxProvider } from "@/redux/reduxProvider";
import type { Metadata } from "next";
import "./globals.css";

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
      <body className="flex min-h-screen w-full flex-col items-center bg-hero-bg bg-cover bg-center bg-no-repeat antialiased">
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
