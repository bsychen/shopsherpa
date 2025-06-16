"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colours } from "@/styles/colours";

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/search",
      label: "Search",
      icon: (isActive: boolean) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      href: "/chats",
      label: "Community",
      icon: (isActive: boolean) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8zm-3-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586"
          />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: (isActive: boolean) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Forest of Trees */}
      <div className="relative w-full h-8 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 400 32"
          preserveAspectRatio="none"
          style={{ fill: colours.card.background }}
        >
          {/* Back Layer - Tallest trees, most transparent - positioned to fill gaps (6 mountains) */}
          <g opacity="0.4">
            {/* Unique mountain 1 - Very wide mountain spanning larger area */}
            <polygon points="0,32 18,0 36,32" />
            <polygon points="8,32 18,2 28,32" />
            
            {/* Unique mountain 2 - Massive wide mountain range */}
            <polygon points="35,32 68,1 101,32" />
            <polygon points="46,32 68,4 90,32" />
            
            {/* Unique mountain 3 - Broad asymmetric peak covering more ground */}
            <polygon points="100,32 125,3 150,32" />
            <polygon points="110,32 130,1 145,32" />
            
            {/* Unique mountain 4 - Extra wide base mountain */}
            <polygon points="148,32 180,0 212,32" />
            <polygon points="160,32 180,3 200,32" />
            
            {/* Unique mountain 5 - Wide off-center peak with broader base */}
            <polygon points="210,32 245,2 280,32" />
            <polygon points="225,32 248,0 270,32" />
            
            {/* Unique mountain 6 - Massive edge mountain range covering remaining space */}
            <polygon points="278,32 320,1 362,32" />
            <polygon points="290,32 320,4 350,32" />
            <polygon points="355,32 380,2 405,32" />
          </g>
          
          {/* Middle Layer - Medium height trees - positioned between front and back (7 mountains) */}
          <g opacity="0.7">
            {/* Unique mid mountain 1 - Very broad base */}
            <polygon points="12,32 40,8 68,32" />
            <polygon points="22,32 40,12 58,32" />
            
            {/* Unique mid mountain 2 - Wide and tall */}
            <polygon points="65,32 88,5 111,32" />
            <polygon points="73,32 88,9 103,32" />
            
            {/* Unique mid mountain 3 - Broad leaning mountain */}
            <polygon points="108,32 130,7 152,32" />
            <polygon points="118,32 135,11 147,32" />
            
            {/* Unique mid mountain 4 - Wide triple peak range */}
            <polygon points="150,32 175,6 200,32" />
            <polygon points="158,32 175,10 192,32" />
            <polygon points="195,32 205,8 215,32" />
            
            {/* Unique mid mountain 5 - Very wide and short range */}
            <polygon points="210,32 240,12 270,32" />
            <polygon points="222,32 240,16 258,32" />
            
            {/* Unique mid mountain 6 - Wide pointed peak */}
            <polygon points="265,32 285,6 305,32" />
            <polygon points="273,32 285,10 297,32" />
            
            {/* Unique mid mountain 7 - Large edge mountain covering remaining space */}
            <polygon points="300,32 340,9 380,32" />
            <polygon points="315,32 345,5 375,32" />
            <polygon points="370,32 390,8 410,32" />
          </g>
          
          {/* Front Layer - More spaced out, fully opaque */}
          <g opacity="1">
            {/* Unique front mountain 1 - Very wide and chunky */}
            <polygon points="0,32 25,18 50,32" />
            <polygon points="10,32 25,22 40,32" />
            
            {/* Unique front mountain 2 - Wide tall spire */}
            <polygon points="45,32 65,13 85,32" />
            <polygon points="53,32 65,17 77,32" />
            
            {/* Unique front mountain 3 - Broad crooked peak */}
            <polygon points="80,32 105,19 130,32" />
            <polygon points="90,32 108,15 120,32" />
            
            {/* Unique front mountain 4 - Massive broad mountain */}
            <polygon points="125,32 155,16 185,32" />
            <polygon points="137,32 155,20 173,32" />
            
            {/* Unique front mountain 5 - Wide sharp peak */}
            <polygon points="170,32 190,14 210,32" />
            <polygon points="178,32 190,18 202,32" />
            
            {/* Unique front mountain 6 - Very wide rolling mountain */}
            <polygon points="215,32 245,17 275,32" />
            <polygon points="227,32 245,21 263,32" />
            
            {/* Unique front mountain 7 - Wide jagged mountain range */}
            <polygon points="265,32 285,15 305,32" />
            <polygon points="272,32 285,19 298,32" />
            <polygon points="300,32 310,13 320,32" />
            
            {/* Unique front mountain 8 - Wide mesa mountain */}
            <polygon points="310,32 340,16 370,32" />
            <polygon points="322,32 340,20 358,32" />
            
            {/* Unique front mountain 9 - Broad twisted mountain */}
            <polygon points="350,32 380,21 410,32" />
            <polygon points="365,32 383,17 395,32" />
          </g>
        </svg>
      </div>
      
      <nav
        className="border-t"
        style={{
          backgroundColor: colours.card.background,
          borderTopColor: colours.card.background,
        }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200"
              style={{
                color: isActive ? colours.button.primary.background : colours.text.primary,
              }}
            >
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </div>
  );
};

export default BottomNav;
