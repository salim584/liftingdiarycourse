import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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
  title: "Lifting Diary",
  description: "Track your workouts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="flex items-center justify-between px-6 py-3 border-b">
            <span className="font-semibold text-lg">Lifting Diary</span>
            <nav className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 bg-white text-sm font-medium hover:bg-blue-50 transition-colors">Sign up</button>
              </SignUpButton>
              <UserButton />
            </nav>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
