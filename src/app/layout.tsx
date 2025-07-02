import type React from "react"
import type { Metadata } from "next"
import TopBar from "@/components/topBar"
import BottomNav from "@/components/BottomNav"
import { colours } from "@/styles/colours"
import { TopBarProvider } from "@/contexts/TopBarContext"
import NavigationLoader from "@/components/NavigationLoader"

import "./globals.css";

export const metadata: Metadata = {
  title: "ShopSherpa",
  description: "Compare supermarket prices",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://images.openfoodfacts.org" />
        <link rel="preconnect" href="https://images.openfoodfacts.net" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShopSherpa" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <TopBarProvider>
          <NavigationLoader />
          <div style={{ backgroundColor: colours.card.background }}>
            <TopBar />
          </div>
          <div style={{ backgroundColor: colours.background.secondary }}>
            <main className="pb-16">
              {children}
            </main>
            <BottomNav />
          </div>
        </TopBarProvider>
      </body>
    </html>
  )
}
