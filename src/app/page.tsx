"use client"

import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to ShopSmart</h1>
        <div className="flex flex-col gap-4 w-full">
          <Link href="/search">
            <button className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow">
              Search for a Product
            </button>
          </Link>
          <Link href="/scan">
            <button className="w-full px-6 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow">
              Scan a Barcode
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
