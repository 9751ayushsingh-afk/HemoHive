import type { Metadata } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AppWithLoader from "../components/AppWithLoader";
import { Providers } from "./providers";
import { NotificationProvider } from "../contexts/NotificationContext";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "HemoHive",
  description: "Delivering Hope, Saving Lives.",
  icons: {
    icon: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/HemoHive_logo",
    shortcut: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/HemoHive_logo",
    apple: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/HemoHive_logo",
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
        className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200`}
      >
        <Providers>
          <NotificationProvider>
            <AppWithLoader>{children}</AppWithLoader>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}