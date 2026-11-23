
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shine Master Solution | VIP Referral Wash",
  description:
    "Join Shine Master Solution VIP Referral Wash. Enjoy exclusive car wash rewards and share your personal referral QR code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
