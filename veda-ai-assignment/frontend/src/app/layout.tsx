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
  title: "VedaAI – Assessment Creator",
  description: "AI-powered question paper generator for educators",
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
      <body className="min-h-full flex flex-col bg-slate-50">
        {/* Global navigation */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                    <path d="M10.75 16.82A7.462 7.462 0 0 1 10 17c-.314 0-.62-.02-.922-.06a.75.75 0 0 1 .197-1.487c.236.03.477.047.725.047.277 0 .548-.02.814-.057a.75.75 0 0 1 .204 1.488ZM12.744 15.14a.75.75 0 0 1 .228-1.036 7.5 7.5 0 0 0 0-12.207.75.75 0 1 1 .808-1.265 9 9 0 0 1 0 14.736.75.75 0 0 1-1.036-.228Zm-5.716 0a.75.75 0 0 1-1.036.228A9 9 0 0 1 6 1.633a.75.75 0 0 1 .808 1.265 7.5 7.5 0 0 0 0 12.207.75.75 0 0 1 .22 1.036ZM9.172 13.748a.75.75 0 0 1-.006-1.061 4.5 4.5 0 0 0 0-6.374.75.75 0 0 1 1.067-1.055 6 6 0 0 1 0 8.484.75.75 0 0 1-1.061.006Z" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 text-lg">VedaAI</span>
              </a>
              <nav className="flex items-center gap-1">
                <a
                  href="/create"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  Create
                </a>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white no-print">
          © 2025 VedaAI · AI Assessment Creator
        </footer>
      </body>
    </html>
  );
}
