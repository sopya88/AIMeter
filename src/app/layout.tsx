import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AIMeter — AI Usage & Billing Dashboard",
  description: "Track AI spend across OpenAI, Anthropic, Google Gemini & AWS Bedrock",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex" style={{ background: "var(--bg)" }}>
        <Sidebar />
        {/* pt-12 clears fixed top bar on mobile; pb-16 clears bottom nav */}
        <main className="flex-1 overflow-y-auto h-screen scrollbar-thin pt-12 pb-16 md:pt-0 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
