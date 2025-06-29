"use client"

import { Product } from "@/types/product"
import { colours } from "@/styles/colours"
import ProductCard from "../cards/ProductCard"
import ContentBox from "../community/ContentBox"

interface ProductsByBrandProps {
  products: Product[]
  brandName: string
  currentProductId: string
}

export default function ProductsByBrand({ products, brandName }: ProductsByBrandProps) {
  return (
    <div className="w-full max-w-xl flex flex-col items-start mb-2">
      <ContentBox variant="secondary" noPadding noMargin className="border mb-2">
        <div className="p-4">
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
      </ContentBox>
    </div>
  )
}
