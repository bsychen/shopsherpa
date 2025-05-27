"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const mockProducts = [
  { id: "1", title: "Organic Bananas", subtitle: "Tesco Finest", price: "£1.20" },
  { id: "2", title: "Whole Milk", subtitle: "2 Pint", price: "£1.45" },
  { id: "3", title: "Brown Bread", subtitle: "Hovis Medium", price: "£1.10" },
]

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showResults, setShowResults] = useState(false)

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Results */}
      <main className="p-4">
        {showResults && (
          <div className="space-y-3">
            {mockProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-600">IMG</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{product.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!showResults && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Search for Products</h2>
            <p className="text-gray-500">Enter a product name to find prices across UK supermarkets</p>
          </div>
        )}
      </main>

      {/* Virtual Keyboard Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-200 p-4">
        <div className="grid grid-cols-10 gap-1 text-xs">
          {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((key) => (
            <Button key={key} variant="outline" size="sm" className="h-8">
              {key}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1 text-xs mt-1">
          {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((key) => (
            <Button key={key} variant="outline" size="sm" className="h-8">
              {key}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs mt-1">
          {["Z", "X", "C", "V", "B", "N", "M"].map((key) => (
            <Button key={key} variant="outline" size="sm" className="h-8">
              {key}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          <Button variant="outline" size="sm" className="h-8 flex-1">
            123
          </Button>
          <Button variant="outline" size="sm" className="h-8 flex-[3]">
            Space
          </Button>
          <Button variant="default" size="sm" className="h-8 flex-1">
            Go
          </Button>
        </div>
      </div>
    </div>
  )
}
