"use client";

import { colours } from "@/styles/colours";

export default function TopBar() {
  return (
    <header className="w-full shadow flex items-center justify-center px-4 py-3 " style={{ backgroundColor: colours.card.background }}>
      <h1
        className="text-xl font-bold tracking-tight select-none"
        style={{ color: colours.text.primary }}
      >
        ShopSmart
      </h1>
    </header>
  );
}