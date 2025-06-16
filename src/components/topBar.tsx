"use client";

import { colours } from "@/styles/colours";
import Image from "next/image";

export default function TopBar() {
  return (
    <div className="relative w-full">
      <header className="w-full flex items-center justify-center px-4 py-6 relative z-10" style={{ backgroundColor: colours.card.background }}>
        <div className="flex items-center gap-3 relative z-20">
          <h1
            className="text-xl font-bold tracking-tight select-none"
            style={{ color: colours.text.primary }}
          >
            ShopSherpa
          </h1>
          <Image
            src="/shopping-cart.svg"
            alt="Shopping Cart"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        
        {/* Smaller mountains underneath the ShopSmart text with shadow */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-8 overflow-hidden z-10">
          <svg
            className="absolute bottom-0 w-full h-full drop-shadow-md"
            viewBox="0 0 400 32"
            preserveAspectRatio="none"
            style={{ fill: colours.background.secondary }}
          >
            {/* Back Layer - Tallest mountains, most transparent */}
            <g opacity="0.4">
              {/* Back mountain 1 - Sharp narrow peak */}
              <polygon points="0,32 15,2 30,32" />
              <polygon points="8,32 15,5 22,32" />
              
              {/* Back mountain 2 - Wide asymmetric range - overlaps previous */}
              <polygon points="25,32 70,1 100,32" />
              <polygon points="35,32 73,4 90,32" />
              
              {/* Back mountain 3 - Tall irregular peak - overlaps previous */}
              <polygon points="95,32 135,3 155,32" />
              <polygon points="105,32 138,0 145,32" />
              
              {/* Back mountain 4 - Massive wide mountain - overlaps previous */}
              <polygon points="150,32 210,2 250,32" />
              <polygon points="165,32 213,6 235,32" />
              
              {/* Back mountain 5 - Twin peaks - overlaps previous */}
              <polygon points="245,32 285,4 325,32" />
              <polygon points="320,32 340,1 360,32" />
              <polygon points="330,32 340,5 350,32" />
              
              {/* Back mountain 6 - Edge mountain - overlaps previous */}
              <polygon points="355,32 385,3 410,32" />
              <polygon points="365,32 385,7 400,32" />
            </g>
            
            {/* Middle Layer - Medium height mountains positioned in troughs */}
            <g opacity="0.7">
              {/* Mid mountain 1 - Overlapping coverage */}
              <polygon points="0,32 25,12 50,32" />
              <polygon points="10,32 25,16 40,32" />
              
              {/* Mid mountain 2 - Small irregular peak */}
              <polygon points="35,32 48,14 61,32" />
              <polygon points="41,32 48,18 55,32" />
              
              {/* Mid mountain 3 - Overlaps and fills gaps */}
              <polygon points="45,32 75,10 105,32" />
              <polygon points="55,32 75,14 95,32" />
              
              {/* Mid mountain 4 - Asymmetric narrow peak */}
              <polygon points="90,32 108,13 126,32" />
              <polygon points="98,32 111,17 119,32" />
              
              {/* Mid mountain 5 - Continuous coverage */}
              <polygon points="100,32 135,11 170,32" />
              <polygon points="115,32 135,15 155,32" />
              
              {/* Mid mountain 6 - Small ridge */}
              <polygon points="155,32 167,15 179,32" />
              <polygon points="161,32 167,19 173,32" />
              
              {/* Mid mountain 7 - Overlapping ranges */}
              <polygon points="165,32 200,13 235,32" />
              <polygon points="175,32 200,17 225,32" />
              
              {/* Mid mountain 8 - Irregular small peak */}
              <polygon points="220,32 235,11 250,32" />
              <polygon points="227,32 238,15 243,32" />
              
              {/* Mid mountain 9 - Connected peaks */}
              <polygon points="230,32 265,9 300,32" />
              <polygon points="240,32 265,13 290,32" />
              
              {/* Mid mountain 10 - Narrow spire */}
              <polygon points="285,32 298,12 311,32" />
              <polygon points="291,32 298,16 305,32" />
              
              {/* Mid mountain 11 - Seamless connection */}
              <polygon points="295,32 330,14 365,32" />
              <polygon points="310,32 330,18 350,32" />
              
              {/* Mid mountain 12 - Small offset peak */}
              <polygon points="350,32 365,13 380,32" />
              <polygon points="357,32 365,17 373,32" />
              
              {/* Mid mountain 13 - Edge to edge coverage */}
              <polygon points="360,32 385,12 410,32" />
              <polygon points="370,32 385,16 400,32" />
            </g>
            
            {/* Front Layer - Shorter mountains, fully opaque */}
            <g opacity="1">
              {/* Front mountain 1 - Full coverage start */}
              <polygon points="0,32 30,20 60,32" />
              <polygon points="15,32 30,24 45,32" />
              
              {/* Front mountain 2 - Overlapping coverage */}
              <polygon points="55,32 80,18 105,32" />
              <polygon points="65,32 80,22 95,32" />
              
              {/* Front mountain 3 - Continuous range */}
              <polygon points="100,32 135,19 170,32" />
              <polygon points="115,32 135,23 155,32" />
              
              {/* Front mountain 4 - Connected peaks */}
              <polygon points="165,32 195,17 225,32" />
              <polygon points="180,32 195,21 210,32" />
              
              {/* Front mountain 5 - Seamless cluster */}
              <polygon points="220,32 250,16 280,32" />
              <polygon points="275,32 300,18 325,32" />
              <polygon points="235,32 250,20 265,32" />
              
              {/* Front mountain 6 - Wide coverage */}
              <polygon points="320,32 355,19 390,32" />
              <polygon points="335,32 355,23 375,32" />
              
              {/* Front mountain 7 - Edge completion */}
              <polygon points="385,32 400,15 415,32" />
              <polygon points="390,32 400,19 410,32" />
            </g>
          </svg>
        </div>
      </header>
    </div>
  );
}