import type { Metadata } from "next";
import { Inter, Poppins, Playfair_Display, JetBrains_Mono } from "next/font/google";
import AppWithLoader from "../components/AppWithLoader";
import { Providers } from "./providers";
import { NotificationProvider } from "../contexts/NotificationContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-headline",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-accent",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-tech",
});

export const metadata: Metadata = {
  title: "HemoHive",
  description: "Delivering Hope, Saving Lives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <Providers>
          <NotificationProvider>
            <AppWithLoader>{children}</AppWithLoader>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}