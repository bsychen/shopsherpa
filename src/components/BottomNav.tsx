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
          {/* Back Layer - Tallest trees, most transparent - positioned to fill gaps */}
          <g opacity="0.4">
            {/* Unique mountain 1 - Tall and wider base */}
            <polygon points="0,32 12,0 24,32" />
            <polygon points="6,32 12,2 18,32" />
            
            {/* Unique mountain 2 - Very wide mountain range */}
            <polygon points="25,32 45,1 65,32" />
            <polygon points="32,32 45,4 58,32" />
            
            {/* Unique mountain 3 - Broad asymmetric peak */}
            <polygon points="70,32 85,3 105,32" />
            <polygon points="77,32 88,1 98,32" />
            
            {/* Unique mountain 4 - Massive wide base */}
            <polygon points="108,32 130,0 152,32" />
            <polygon points="118,32 130,3 142,32" />
            
            {/* Unique mountain 5 - Wide off-center peak */}
            <polygon points="155,32 175,2 200,32" />
            <polygon points="165,32 178,0 190,32" />
            
            {/* Unique mountain 6 - Medium wide range */}
            <polygon points="205,32 225,4 245,32" />
            <polygon points="215,32 225,1 235,32" />
            
            {/* Unique mountain 7 - Tall spire with wide base */}
            <polygon points="248,32 265,0 282,32" />
            <polygon points="256,32 265,3 274,32" />
            
            {/* Unique mountain 8 - Massive double peak range */}
            <polygon points="285,32 305,1 325,32" />
            <polygon points="292,32 302,4 312,32" />
            <polygon points="313,32 320,2 327,32" />
            
            {/* Unique mountain 9 - Wide irregular mountain */}
            <polygon points="330,32 355,3 380,32" />
            <polygon points="340,32 358,0 370,32" />
            
            {/* Unique mountain 10 - Edge mountain range */}
            <polygon points="375,32 390,1 405,32" />
            <polygon points="382,32 390,4 398,32" />
          </g>
          
          {/* Middle Layer - Medium height trees - positioned between front and back */}
          <g opacity="0.7">
            {/* Unique mid mountain 1 - Very broad base */}
            <polygon points="15,32 35,8 55,32" />
            <polygon points="25,32 35,12 45,32" />
            
            {/* Unique mid mountain 2 - Wide and tall */}
            <polygon points="55,32 72,5 89,32" />
            <polygon points="63,32 72,9 81,32" />
            
            {/* Unique mid mountain 3 - Broad leaning mountain */}
            <polygon points="92,32 110,7 128,32" />
            <polygon points="100,32 113,11 121,32" />
            
            {/* Unique mid mountain 4 - Wide triple peak range */}
            <polygon points="135,32 155,6 175,32" />
            <polygon points="142,32 155,10 168,32" />
            <polygon points="170,32 177,8 184,32" />
            
            {/* Unique mid mountain 5 - Very wide and short range */}
            <polygon points="190,32 215,12 240,32" />
            <polygon points="200,32 215,16 230,32" />
            
            {/* Unique mid mountain 6 - Wide pointed peak */}
            <polygon points="235,32 250,6 265,32" />
            <polygon points="242,32 250,10 258,32" />
            
            {/* Unique mid mountain 7 - Large irregular mountain */}
            <polygon points="270,32 290,9 315,32" />
            <polygon points="278,32 293,5 307,32" />
            
            {/* Unique mid mountain 8 - Wide double mountain cluster */}
            <polygon points="320,32 340,7 360,32" />
            <polygon points="328,32 340,11 352,32" />
            <polygon points="355,32 365,9 375,32" />
            
            {/* Unique mid mountain 9 - Broad leaning range */}
            <polygon points="365,32 385,8 405,32" />
            <polygon points="373,32 388,12 398,32" />
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
