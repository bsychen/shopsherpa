"use client";

import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { colours } from "@/styles/colours";

export default function BarcodeScanner() {
  const [manualInput, setManualInput] = React.useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let controls: { stop: () => void } | null = null;

    (async () => {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length > 0 && videoRef.current) {
        const codeReader = new BrowserMultiFormatReader();
        controls = await codeReader.decodeFromVideoDevice(
          devices[0].deviceId,
          videoRef.current,
          (result, _err, c) => {
            if (result && active) {
              router.push(`/product/${result.getText()}`);
              c.stop();
              active = false;
            }
          }
        );
      }
    })();

    return () => {
      active = false;
      if (controls) controls.stop();
    };
  }, [router]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualInput.trim();
    if (code) {
      router.push(`/product/${code}`);
    }
  };

  return (
    <div 
      className="max-w-md mx-auto mt-10 rounded-xl shadow p-8 flex flex-col min-h-[400px] items-center justify-center"
      style={{
        backgroundColor: colours.card.background,
        border: `1px solid ${colours.card.border}`
      }}
    >
      <div className="relative w-full h-10 mb-2">
              <Link
                href="/"
                className="flex items-center hover:underline absolute top-0 left-0 z-20"
                style={{ color: colours.text.link }}
              >
                <span className="mr-2 text-2xl">&#8592;</span>
                <span className="font-semibold">Go back home</span>
              </Link>
      </div>
      <h1 
        className="text-2xl font-bold mb-6 text-center w-full"
        style={{ color: colours.text.primary }}
      >
        Scan a Barcode
      </h1>
      <div 
        className="rounded-lg overflow-hidden shadow mb-6 w-full max-w-xs flex items-center justify-center aspect-video"
        style={{ 
          backgroundColor: colours.content.surface,
          border: `1px solid ${colours.content.border}`
        }}
      >
        <video ref={videoRef} className="w-full h-auto" />
      </div>
      <form onSubmit={handleManualSubmit} className="w-full flex justify-center mb-6">
        <div className="w-full max-w-md flex gap-2">
          <input
            id="manual-barcode"
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 sm:px-5 sm:py-3 rounded-lg focus:outline-none shadow-md transition-all duration-200 focus:scale-[1.03] text-base sm:text-lg"
            style={{
              backgroundColor: colours.input.background,
              border: `2px solid ${colours.input.border}`,
              color: colours.input.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colours.input.focus.border;
              e.target.style.boxShadow = colours.input.focus.ring;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colours.input.border;
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Enter barcode"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors font-bold text-base sm:text-lg shadow-md focus:outline-none flex items-center justify-center"
            style={{
              backgroundColor: colours.button.primary.background,
              color: colours.button.primary.text
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.hover.background}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colours.button.primary.background}
            onFocus={(e) => e.currentTarget.style.boxShadow = colours.input.focus.ring}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            aria-label="Barcode"
          >
            <Image src="/barcode-2.svg" alt="Barcode" width={32} height={32} className="h-8 w-8 invert" />
          </button>
        </div>
      </form>
    </div>
  );
}
