import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/auth-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import "./globals.css";

// ──────────────────────────────────────────────
// Fonts
// ──────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// ──────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "SkyBook — Flight Management",
    template: "%s | SkyBook",
  },
  description:
    "Book flights, select seats in real-time, and manage your bookings with SkyBook — a modern flight management platform.",
  keywords: ["flight booking", "seat selection", "airline", "travel"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SkyBook",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
};

// ──────────────────────────────────────────────
// Root Layout
// ──────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
