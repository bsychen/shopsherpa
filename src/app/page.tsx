"use client"

import Link from "next/link"
import Image from "next/image"
import { colours } from "@/styles/colours"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to ShopSmart</h1>
        <div className="flex flex-col gap-4 w-full">
          <Link href="/search">
            <button 
              className="w-full px-6 py-4 rounded-lg text-lg font-semibold transition-colors shadow flex items-center justify-between group"
              style={{ 
                backgroundColor: colours.button.primary.background,
                color: colours.button.primary.text
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.hover.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.background}
            >
              <span className="text-left w-full">Search for a Product</span>
              <Image src="/search.svg" alt="Search" width={28} height={28} className="h-7 w-7 ml-4 filter invert group-hover:invert-0" />
            </button>
          </Link>
          <Link href="/chats">
            <button 
              className="w-full px-6 py-4 rounded-lg text-lg font-semibold transition-colors shadow flex items-center justify-between group"
              style={{ 
                backgroundColor: colours.button.primary.background,
                color: colours.button.primary.text
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.hover.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.background}
            >
              <span className="text-left w-full">Community Posts</span>
              <Image src="/message-square.svg" alt="Community Posts" width={28} height={28} className="h-7 w-7 ml-4 filter invert group-hover:invert-0" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
