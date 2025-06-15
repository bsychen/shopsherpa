"use client"

import { Product } from "@/types/product"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  return (
    <button 
      className="flex flex-col items-center rounded-xl shadow-lg border-2 border-black p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-slate-100"
      style={{ 
        width: '100px', 
        flex: '0 0 auto',
        scrollSnapAlign: 'center',
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
      onClick={handleClick}
    >
      <Image
        src={product.imageUrl || "/placeholder.jpg"}
        alt={product.productName}
        width={40}
        height={40}
        className="w-10 h-10 object-contain rounded mb-2"
        style={{ 

        }}
      />
      <div 
        className="font-medium text-xs text-center mb-1 line-clamp-2 w-full"
        style={{ color: '#1f2937' }}
      >
        {product.productName}
      </div>
      <div 
        className="text-[10px] font-medium"
        style={{ color: '#6b7280' }}
      >
        {product.brandName || 'Unknown Brand'}
      </div>
    </button>
  )
}
