import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from '@/lib/langContext';
import LanguageSelector from '@/components/LanguageSelector';
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
  title: "HealthCare AI Assistant - Symptom Checker",
  description: "Free AI-powered health chatbot that provides health information based on your symptoms. Educational tool for health awareness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <div style={{ position: 'fixed', top: 8, right: 12, zIndex: 60 }}>
              <LanguageSelector />
            </div>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
