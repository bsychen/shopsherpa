"use client";

import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";

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
      router.push(`/${code}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-6">Scan a Barcode</h1>
      <div className="rounded-lg overflow-hidden shadow mb-6 w-full max-w-xs bg-white dark:bg-zinc-900 flex items-center justify-center aspect-video">
        <video ref={videoRef} className="w-full h-auto" />
      </div>
      <form onSubmit={handleManualSubmit} className="flex flex-col items-center gap-2 w-full max-w-xs">
        <label htmlFor="manual-barcode" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Or enter barcode manually:</label>
        <div className="flex w-full gap-2">
          <input
            id="manual-barcode"
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="Enter barcode"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
          >
            Go
          </button>
        </div>
      </form>
    </div>
  );
}
