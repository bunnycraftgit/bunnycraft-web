import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "BunnyCraft — Custom 3D Printing",
    template: "%s | BunnyCraft",
  },
  description:
    "Upload your design, choose your filament, get an instant price estimate, and order custom 3D printed parts with confidence.",
  keywords: [
    "3D printing",
    "custom 3D printing",
    "STL printing service",
    "PLA",
    "PETG",
    "3D printed miniatures",
    "custom figures",
  ],
  openGraph: {
    title: "BunnyCraft — Custom 3D Printing",
    description:
      "Upload your design, choose your filament, get an instant price estimate, and order with confidence.",
    siteName: "BunnyCraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BunnyCraft — Custom 3D Printing",
    description:
      "Upload your design, choose your filament, get an instant price estimate, and order with confidence.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
