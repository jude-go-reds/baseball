import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SignedOutButtons } from "./AuthHeader";
import { FavoritesSyncProvider } from "./FavoritesSyncProvider";
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
  title: "Stat Cards",
  description: "Generate shareable baseball cards for any MLB player.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
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
          <FavoritesSyncProvider>
            <header className="flex h-16 items-center justify-end gap-3 p-3 text-sm">
              <Show when="signed-out">
                <SignedOutButtons />
              </Show>
              <Show when="signed-in">
                <UserButton
                  appearance={{ elements: { userButtonAvatarBox: "h-10 w-10" } }}
                />
              </Show>
            </header>
            {children}
          </FavoritesSyncProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
