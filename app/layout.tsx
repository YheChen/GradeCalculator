import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradeCalculator",
  description:
    "Grade calculator for multiple classes. Saves in browser memory!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
