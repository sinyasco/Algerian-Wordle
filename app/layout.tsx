import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algerian Wordle",
  description: "Guess the Algerian word — in Arabic or Arabizi.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
