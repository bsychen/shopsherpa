"use client"

import { Product } from "@/types/product"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { colours } from "@/styles/colours"

interface ProductsByBrandProps {
  products: Product[]
  brandName: string
  currentProductId: string
}

export default function ProductsByBrand({ products, brandName }: ProductsByBrandProps) {
  const router = useRouter()

  return (
    <div className="w-full max-w-xl flex flex-col items-start mb-4">
      <div 
        className="w-full rounded-xl p-4 border"
        style={{ 
          backgroundColor: colours.content.surfaceSecondary,
          borderColor: colours.content.border 
        }}
      >
        <h2 
          className="text-lg font-semibold mb-3 px-1"
          style={{ color: colours.text.primary }}
        >
          More by {brandName}
        </h2>
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
          <div 
            className="flex space-x-4 px-1 scroll-pl-6" 
            style={{ 
              width: 'max-content',
              scrollSnapType: 'x mandatory',
              scrollPaddingLeft: '50%',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.length > 0 ? products.map(prod => (
              <div 
                key={prod.id} 
                className="flex flex-col items-center rounded-lg p-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 hover:opacity-100 border"
                style={{ 
                  width: '100px', 
                  flex: '0 0 auto',
                  scrollSnapAlign: 'center',
                  opacity: 0.85,
                  backgroundColor: colours.content.surface,
                  borderColor: colours.content.border
                }}
              >
                <Image
                  src={prod.imageUrl || "/placeholder.jpg"}
                  alt={prod.productName}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain rounded mb-2 border"
                  style={{ 
                    borderColor: colours.content.border,
                    backgroundColor: colours.content.surface
                  }}
                />
                <div 
                  className="font-medium text-xs text-center mb-1 line-clamp-2 w-full"
                  style={{ color: colours.text.primary }}
                >
                  {prod.productName}
                </div>
                <div 
                  className="text-[10px] mb-1"
                  style={{ color: colours.text.secondary }}
                >
                  {prod.brandName || 'Unknown Brand'}
                </div>
                <button 
                  onClick={() => router.push(`/product/${prod.id}`)}
                  className="text-[10px] hover:underline"
                  style={{ color: colours.text.link }}
                >
                  View
                </button>
              </div>
            )) : (
              <div 
                className="w-full text-center text-sm py-4"
                style={{ color: colours.text.secondary }}
              >
                No other products from this brand
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
