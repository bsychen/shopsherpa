"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import Link from "next/link";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { searchProducts } from "@/lib/api";
import { colours } from "@/styles/colours";
import { ProductSearchResult } from "@/types/product";
import RecentlyViewedProducts from "@/components/search/RecentlyViewedProducts";
import ContentBox from "@/components/community/ContentBox";
import LoadingAnimation from "@/components/LoadingSpinner";
import SearchButton from "@/components/search/SearchButton";
import { useTopBar } from "@/contexts/TopBarContext";

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized SearchResult component for better performance
const SearchResult = memo(({ product, onSelect }: { product: ProductSearchResult; onSelect: () => void }) => {
  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onSelect}
      className="block p-3 transition cursor-pointer border-b last:border-b-0 hover:scale-[1.02] duration-200"
      style={{ 
        borderColor: colours.content.border
      }}
    >
      <div 
        className="font-medium text-sm mb-1"
        style={{ color: colours.text.primary }}
      >
        {product.productName}
      </div>
      <div 
        className="text-xs"
        style={{ color: colours.text.muted }}
      >
        <span className="font-semibold">
          {product.brandName}
        </span>
      </div>
    </Link>
  );
});

SearchResult.displayName = 'SearchResult';

export default function ProductSearch() {
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [filteredCameras, setFilteredCameras] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraControlsRef = useRef<{ stop: () => void } | null>(null);
  const router = useRouter();
  const { setNavigating } = useTopBar();
  
  const debouncedQuery = useDebounce(query, 500); // Increased debounce delay

  // Filter cameras to select only back camera (prefer ultrawide if available)
  const filterCameras = async (devices: MediaDeviceInfo[]): Promise<MediaDeviceInfo[]> => {
    const backCameras: MediaDeviceInfo[] = [];
    const frontCameras: MediaDeviceInfo[] = [];
    const ultrawideCameras: MediaDeviceInfo[] = [];
    
    // First, try to get proper camera permissions to ensure device labels are available
    let permissionGranted = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      permissionGranted = true;
      
      // Re-enumerate devices after permission is granted to get proper labels
      const devicesWithLabels = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesWithLabels.filter(device => device.kind === 'videoinput');
      
      // Use the devices with proper labels if available
      if (videoDevices.length > 0) {
        devices = videoDevices;
      }
    } catch {
      // Permission denied or not available, continue with existing devices
    }
    
    for (const device of devices) {
      try {
        // Get camera capabilities to determine facing mode (only if permission granted)
        if (permissionGranted) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: device.deviceId }
          });
          
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();
          const settings = track.getSettings();
          
          // Stop the stream immediately
          stream.getTracks().forEach(track => track.stop());
          
          // Check for facing mode or camera type in label
          const label = device.label.toLowerCase();
          const facingMode = settings.facingMode || capabilities.facingMode;
          
          // Categorize cameras with more specific filtering
          if (facingMode === 'user' || 
              label.includes('front') || 
              label.includes('selfie')) {
            frontCameras.push(device);
          }
          else if (label.includes('ultra') || 
                   label.includes('wide') ||
                   label.includes('0.5')) {
            ultrawideCameras.push(device);
          }
          else if (facingMode === 'environment' || 
                   label.includes('back') || 
                   label.includes('rear') ||
                   (!label.includes('front') && !label.includes('selfie'))) {
            backCameras.push(device);
          }
        } else {
          // Fallback: use label-based filtering without stream access
          const label = device.label.toLowerCase();
          if (label.includes('front') || 
              label.includes('selfie')) {
            frontCameras.push(device);
          }
          else if (label.includes('ultra') || 
                   label.includes('wide') ||
                   label.includes('0.5')) {
            ultrawideCameras.push(device);
          }
          else if (label.includes('back') || 
                   label.includes('rear') ||
                   (!label.includes('front') && !label.includes('selfie'))) {
            backCameras.push(device);
          }
        }
      } catch {
        // If we can't get capabilities, use label-based filtering
        const label = device.label.toLowerCase();
        if (label.includes('front') || 
            label.includes('selfie')) {
          frontCameras.push(device);
        }
        else if (label.includes('ultra') || 
                 label.includes('wide') ||
                 label.includes('0.5')) {
          ultrawideCameras.push(device);
        }
        else {
          backCameras.push(device);
        }
      }
    }
    
    // Build final camera selection: only one back camera
    const filtered: MediaDeviceInfo[] = [];
    
    // Select the best back camera (prefer ultrawide if available, otherwise first back camera)
    let selectedBackCamera: MediaDeviceInfo | null = null;
    if (ultrawideCameras.length > 0) {
      // Check if ultrawide is actually a back camera
      const ultrawideBackCamera = ultrawideCameras.find(camera => {
        const label = camera.label.toLowerCase();
        return !label.includes('front') && !label.includes('selfie');
      });
      if (ultrawideBackCamera) {
        selectedBackCamera = ultrawideBackCamera;
      }
    }
    
    // If no ultrawide back camera, use regular back camera
    if (!selectedBackCamera && backCameras.length > 0) {
      selectedBackCamera = backCameras[0];
    }
    
    // If no back camera available, fallback to front camera
    if (!selectedBackCamera && frontCameras.length > 0) {
      selectedBackCamera = frontCameras[0];
    }
    
    // Add selected camera to filtered array
    if (selectedBackCamera) {
      filtered.push(selectedBackCamera);
    }
    
    // Mobile device fallback: if no cameras were categorized properly
    if (filtered.length === 0 && devices.length > 0) {
      // Use the first camera available (usually back camera on mobile)
      filtered.push(devices[0]);
    }
    
    return filtered;
  };

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setNavigating(false); // Clear navigation loading state
    }, 500); // Small delay to ensure smooth navigation experience
    
    return () => clearTimeout(timer);
  }, [setNavigating]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const products = await searchProducts(searchQuery.toLowerCase());
      setResults(products);
      setShowAll(false);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  // Barcode scanner setup - only after page has loaded
  useEffect(() => {
    if (pageLoading) return; // Don't start camera until page is loaded
    
    let active = true;

    const startCamera = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        
        // Filter cameras to only include desired types
        const filtered = await filterCameras(devices);
        setFilteredCameras(filtered);
        
        if (filtered.length > 0 && videoRef.current && active) {
          const selectedDevice = filtered[currentCameraIndex] || filtered[0];
          const codeReader = new BrowserMultiFormatReader();
          const controls = await codeReader.decodeFromVideoDevice(
            selectedDevice.deviceId,
            videoRef.current,
            (result, _err, c) => {
              if (result && active) {
                router.push(`/product/${result.getText()}`);
                c.stop();
                cameraControlsRef.current = null;
                active = false;
              }
            }
          );
          cameraControlsRef.current = controls;
        }
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    };

    // Add a small delay to ensure video element is fully rendered
    const timer = setTimeout(startCamera, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (cameraControlsRef.current) {
        cameraControlsRef.current.stop();
        cameraControlsRef.current = null;
      }
    };
  }, [router, pageLoading, currentCameraIndex]);

  // Separate effect to initialize camera index when cameras are first detected
  useEffect(() => {
    if (filteredCameras.length > 0 && currentCameraIndex !== 0) {
      setCurrentCameraIndex(0); // Always start with back camera (index 0)
    }
  }, [filteredCameras, currentCameraIndex]);

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (cameraControlsRef.current) {
        cameraControlsRef.current.stop();
        cameraControlsRef.current = null;
      }
    };
  }, []);

  const handleManualSearch = () => {
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setShowDropdown(false);
    }
  };

  const handleProductSelect = () => {
    setShowDropdown(false);
    setQuery("");
  };

  if (pageLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div 
      className="relative max-w-2xl mx-auto p-6 flex flex-col items-center min-h-[600px] opacity-0 animate-fade-in"
      style={{
        backgroundColor: colours.background.secondary,
      }}
    >
    <ContentBox className="opacity-0 items-center animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
        <h1 
          className="text-2xl text-center font-bold mb-4"
          style={{ color: colours.text.primary }}
        >
          Search for a Product
        </h1>
        
        {/* Search Bar */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-md flex gap-2">
            <input
              type="text"
              placeholder="Search for a product..."
              onChange={handleInputChange}
              value={query}
              className="flex-1 min-w-0 px-4 py-2 sm:px-5 sm:py-3 rounded-lg shadow-xl border-2 border-black focus:outline-none shadow-md transition-all duration-200 focus:scale-[1.02] text-base sm:text-lg opacity-0 animate-slide-in-left"
              style={{
                backgroundColor: colours.input.background,
                border: `2px solid ${colours.input.border}`,
                color: colours.input.text,
                animationDelay: '50ms'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colours.input.focus.border;
                e.target.style.boxShadow = colours.input.focus.ring;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colours.input.border;
                e.target.style.boxShadow = 'none';
              }}
            />
            <SearchButton
              onClick={handleManualSearch}
              isLoading={isLoading}
              className="opacity-0 animate-slide-in-right"
              style={{ animationDelay: '100ms' }}
            />
          </div>
        </div>
      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="w-full mb-4 animate-scale-in">
          <div 
            className="w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto"
            style={{
              backgroundColor: colours.content.surface,
              border: `1px solid ${colours.content.border}`
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm" style={{ color: colours.text.muted }}>
                  Searching...
                </span>
              </div>
            ) : results.length > 0 ? (
              <>
                {(showAll ? results : results.slice(0, 5)).map((product, index) => (
                  <div key={product.id} className="opacity-0 animate-slide-in-left" style={{ animationDelay: `${index * 30 + 150}ms` }}>
                    <SearchResult 
                      product={product} 
                      onSelect={handleProductSelect}
                    />
                  </div>
                ))}
                {!showAll && results.length > 5 && (
                  <div className="p-2 text-center">
                    <button
                      className="text-sm transition"
                      style={{ color: colours.text.link }}
                      onClick={() => setShowAll(true)}
                    >
                      See {results.length - 5} more results
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
      </ContentBox>

      <ContentBox className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
        {/* Barcode Scanner */}
        <div className="w-full flex items-center flex-col">
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: colours.text.primary }}
          >
            Scan a Barcode
          </h1>
          <div>
            <div 
              className="rounded-lg overflow-hidden shadow-xl mb-4 w-full max-w-xs flex items-center justify-center aspect-video"
              style={{ 
                backgroundColor: colours.content.surface,
                border: `2px solid ${colours.card.border}`
              }}
            >
              <video ref={videoRef} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </ContentBox>

      {/* Recently Viewed Products Section */}
      
      {/* Recently Viewed Products */}
      {firebaseUser && (
        <ContentBox variant="secondary" className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colours.text.secondary }}
          >
            Recently Viewed Products
          </h2>
          <RecentlyViewedProducts userId={firebaseUser.uid} />
        </ContentBox>
      )}
    </div>
  );
}
