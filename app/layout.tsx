import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1,000 Watches | The Definitive Horological Archive",
  description: "A museum of 1,000 iconic watches. Nominate your favorite timepiece and join the definitive collection of watch history.",
  openGraph: {
    title: "1,000 Watches",
    description: "The definitive digital museum of iconic timepieces.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-[#050505] selection:bg-amber-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
