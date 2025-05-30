import type React from "react"
import type { Metadata } from "next"
import TopBar from "@/components/topBar"

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
      <body>
        <TopBar />
        {children}
      </body>
    </html>
  )
}
