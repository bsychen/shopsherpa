"use client"

import { useState } from "react"
import { ArrowLeft, Star, MapPin, Edit3, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ProductPage({ params: { id: _id } }: { params: { id: string } }) {
  const [editingPrice, setEditingPrice] = useState(false)
  const [currentPrice, setCurrentPrice] = useState("1.20")
  const [tempPrice, setTempPrice] = useState(currentPrice)
  const [showSaveAnimation, setShowSaveAnimation] = useState(false)

  const handleSavePrice = () => {
    setCurrentPrice(tempPrice)
    setEditingPrice(false)
    setShowSaveAnimation(true)
    setTimeout(() => setShowSaveAnimation(false), 2000)
  }

  const handleCancelEdit = () => {
    setTempPrice(currentPrice)
    setEditingPrice(false)
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-200 p-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <Link href="/search">
            <ArrowLeft className="w-6 h-6 text-primary-600 hover:text-primary-700 transition-colors" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-600">Product Details</span>
          </div>
        </div>
      </header>

      {/* Product Image */}
      <div className="bg-white p-4 animate-fade-in">
        <div className="w-full h-48 bg-primary-100 rounded-lg flex items-center justify-center border border-primary-200">
          <span className="text-primary-600">Organic Bananas</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary-800">
              <span>Organic Bananas</span>
              <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                Tesco
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Adjustment Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                <span className="font-medium text-primary-800">Your Price Paid</span>
                <div className="flex items-center gap-2">
                  {editingPrice ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-20 h-8 text-center"
                      />
                      <Button
                        size="sm"
                        onClick={handleSavePrice}
                        className="h-8 w-8 p-0 bg-primary-600 hover:bg-primary-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-lg transition-all duration-500 ${showSaveAnimation ? "text-primary-600 scale-110" : "text-primary-800"}`}
                      >
                        £{currentPrice}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPrice(true)}
                        className="h-8 w-8 p-0 hover:bg-primary-100"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {showSaveAnimation && (
                <div className="text-center text-primary-600 text-sm animate-fade-in">
                  ✓ Price updated! This helps improve our database.
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Database Price</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">£1.15</span>
                  <span className="block text-sm text-gray-600">Estimated</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-primary-600 hover:bg-primary-700 transition-all duration-300 hover:scale-105">
              Save to My Items
            </Button>
          </CardContent>
        </Card>

        {/* Location & Suggestions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary-100 border-primary-200 hover:bg-primary-200 transition-colors duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm font-medium text-primary-800">Change Location</p>
            </CardContent>
          </Card>

          <Card className="bg-primary-100 border-primary-200 hover:bg-primary-200 transition-colors duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-primary-800">Similar Products</p>
            </CardContent>
          </Card>
        </div>

        {/* Store Comparison */}
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-primary-600">💰 Bargain</span>
              <span className="font-medium text-red-600">💸 Rip-Off</span>
            </div>

            {/* Price Chart Placeholder */}
            <div className="h-32 bg-gradient-to-r from-primary-100 to-red-100 rounded flex items-center justify-center mb-4 border border-primary-200">
              <span className="text-primary-700">Price Comparison Across Stores</span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border-primary-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-primary-800">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-primary-700">Sarah M.</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-primary-600">
              Great quality bananas, always fresh and reasonably priced at this Tesco location.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
