"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(true)
  const [manualEntry, setManualEntry] = useState(false)
  const [barcode, setBarcode] = useState("")
  const [scanningAnimation, setScanningAnimation] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isScanning && !manualEntry) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.log("Camera access denied:", err)
          setManualEntry(true)
        })
    }

    // Simulate successful scan after 3 seconds
    const timer = setTimeout(() => {
      if (!manualEntry) {
        setScanningAnimation(false)
        setTimeout(() => {
          router.push("/product/scanned-item")
        }, 500)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isScanning, manualEntry, router])

  const handleManualSubmit = () => {
    if (barcode.trim()) {
      router.push(`/product/${barcode}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      {/* Header */}
      <header className="bg-black/20 text-white p-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <Link href="/">
            <ArrowLeft className="w-6 h-6 hover:scale-110 transition-transform" />
          </Link>
          <div className="flex gap-4">
            <Camera className="w-6 h-6" />
            <Type className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Scanner Area */}
      <div className="relative flex-1 flex items-center justify-center p-8 animate-fade-in">
        {!manualEntry ? (
          <div className="relative w-full max-w-sm aspect-square">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-48 h-48 border-4 border-white relative transition-all duration-500 ${scanningAnimation ? "scale-100" : "scale-110 border-primary-300"}`}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>

                {/* Scanning lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-full h-0.5 bg-white transition-all duration-1000 ${scanningAnimation ? "opacity-75 animate-pulse" : "opacity-100 bg-primary-300"}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-4 animate-slide-up">
            <div className="text-center text-white mb-6">
              <h2 className="text-xl font-semibold mb-2">Enter Barcode Manually</h2>
              <p className="text-primary-200">Type the barcode number below</p>
            </div>
            <Input
              type="text"
              placeholder="Enter barcode number"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="text-center text-lg bg-white/90 border-primary-300"
            />
            <Button
              onClick={handleManualSubmit}
              className="w-full bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Search Product
            </Button>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center text-white p-4">
        <p className={`text-lg transition-all duration-500 ${scanningAnimation ? "text-white" : "text-primary-300"}`}>
          {manualEntry ? "Enter barcode manually" : scanningAnimation ? "Looking for barcode..." : "Barcode found!"}
        </p>
      </div>

      {/* Toggle Manual Entry */}
      <div className="p-4">
        <Button
          variant="outline"
          onClick={() => {
            setManualEntry(!manualEntry)
            setIsScanning(!manualEntry)
          }}
          className="w-full text-white border-white hover:bg-white hover:text-primary-800 transition-all duration-300"
        >
          {manualEntry ? "Use Camera" : "Enter Manually"}
        </Button>
      </div>
    </div>
  )
}
