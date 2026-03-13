import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flatline",
  description:
    "Flatline monitors your automations and alerts you the moment one goes silent. Dead man's switch for your workflows.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-flatline-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
