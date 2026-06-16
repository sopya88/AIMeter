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
        <main className="flex-1 overflow-y-auto h-screen scrollbar-thin">
          {children}
        </main>
      </body>
    </html>
  );
}
