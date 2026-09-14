import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContext";
import { ThemeProvider } from "@/components/ThemeContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Attendance Sys — Attendance System Admin Dashboard",
  description: "Admin dashboard for Raspberry Pi RFID, Fingerprint, and Face-recognition attendance system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
