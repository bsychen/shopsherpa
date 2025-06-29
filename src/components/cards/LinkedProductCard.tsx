"use client";

import Image from 'next/image';
import { colours } from '@/styles/colours';
import Link from 'next/link';

interface LinkedProduct {
  id: string;
  name: string;
  imageUrl: string;
}

interface LinkedProductCardProps {
  product: LinkedProduct;
  className?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
}

export default function LinkedProductCard({ 
  product, 
  className = "", 
  size = "sm",
  showLabel = false,
  label = "Referenced Product"
}: LinkedProductCardProps) {
  const imageSize = size === 'sm' ? 32 : 48;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'p-2' : 'p-3';
  
  return (
    <div className={`mb-3 ${className}`}>
      <Link
        href={`/product/${product.id}`}
        className={`flex items-center gap-${size === 'sm' ? '2' : '3'} ${padding} rounded hover:opacity-80 transition-opacity cursor-pointer`}
        style={{ backgroundColor: colours.tag.default.background, border: `1px solid ${colours.tag.default.border}` }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={imageSize}
          height={imageSize}
          className="object-cover rounded"
        />
        <div className="flex-1">
          <p className={`${textSize} font-medium`} style={{ color: colours.tag.default.text }}>
            {product.name}
          </p>
          {showLabel && (
            <p className="text-xs" style={{ color: colours.text.secondary }}>
              {label}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
