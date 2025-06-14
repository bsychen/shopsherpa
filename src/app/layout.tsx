import type React from "react"
import type { Metadata } from "next"
import TopBar from "@/components/topBar"
import BottomNav from "@/components/BottomNav"

import "./globals.css";

export const metadata: Metadata = {
  title: "ShopSmart",
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
      </head>
      <body>
        <TopBar />
        <main className="pb-16">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
