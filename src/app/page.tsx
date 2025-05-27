"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Camera, Search, User, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowActions(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-primary-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <Link href="/profile">
            <User className="w-6 h-6 text-primary-600 hover:text-primary-700 transition-colors" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-8">
        {/* App Title with Animation */}
        <div className="text-center py-16 animate-fade-in">
          <h1 className="text-5xl font-bold text-primary-800 mb-4 tracking-tight">ShopSmart</h1>
          <p className="text-primary-600 text-lg">Smart shopping for UK students</p>
        </div>

        {/* Action Cards with Staggered Animation */}
        <div
          className={`space-y-6 transition-all duration-700 ${showActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Link href="/scan">
            <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-primary-200 hover:border-primary-300 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Camera className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-800">Scan a barcode</h3>
                    <p className="text-primary-600 text-sm">Quick price check with your camera</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/search">
            <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-primary-200 hover:border-primary-300 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Search className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-800">Search for an Item</h3>
                    <p className="text-primary-600 text-sm">Find products by name or category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
