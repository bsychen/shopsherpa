"use client"

import { Product } from "@/types/product"
import { colours } from "@/styles/colours"
import ProductCard from "./ProductCard"

interface ProductsByBrandProps {
  products: Product[]
  brandName: string
  currentProductId: string
}

export default function ProductsByBrand({ products, brandName }: ProductsByBrandProps) {
  return (
    <div className="w-full max-w-xl flex flex-col items-start mb-4">
      <div 
        className="w-full rounded-xl shadow border-2 border-black p-4 border"
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
            {products.length > 0 ? products.map(product => (
              <ProductCard key={product.id} product={product} />
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
