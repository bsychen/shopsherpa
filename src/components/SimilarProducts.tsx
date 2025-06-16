"use client"

import { Product } from "@/types/product"
import { colours } from "@/styles/colours"
import ProductCard from "./ProductCard"
import ContentBox from "./ContentBox"

interface SimilarProductsProps {
  products: Product[]
  currentProductId: string
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  return (
    <div className="w-full max-w-xl flex flex-col items-start mb-2">
      <ContentBox variant="secondary" noPadding noMargin className="border mb-2">
        <div className="p-4">
          <h2 
            className="text-lg font-semibold mb-3 px-1"
            style={{ color: colours.text.primary }}
          >
            Similar Products
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
                  No similar products found
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentBox>
    </div>
  )
}
