"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import { MapPin, Navigation } from "lucide-react";

// Dark mode style cho Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Light mode style (clean & modern)
const lightMapStyle = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d4edda" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fcd34d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bfdbfe" }],
  },
];

interface LocationViewProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCX7Yx5-P_1m7tuM-P9zIk-EOhcad-XoeA";

const LocationView = ({ onLocationSelected }: LocationViewProps) => {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initialPosition, setInitialPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Get current location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setInitialPosition({ lat: 21.0285, lng: 105.8542 }); // Fallback to Hanoi
      setLoadingCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setInitialPosition(currentPosition);
        setLoadingCurrentLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setInitialPosition({ lat: 21.0285, lng: 105.8542 }); // Fallback to Hanoi
        setLoadingCurrentLocation(false);
      }
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || !initialPosition) return;

    const google = (window as any).google;
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: resolvedTheme === "dark" ? darkMapStyle : lightMapStyle,
    });

    const markerInstance = new google.maps.Marker({
      position: initialPosition,
      map: mapInstance,
      draggable: true,
    });

    setSelectedPosition(initialPosition);

    // Add click event to map
    mapInstance.addListener("click", (e: any) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat && lng) {
        const newPosition = { lat, lng };
        markerInstance.setPosition(newPosition);
        setSelectedPosition(newPosition);
      }
    });

    // Add dragend event to marker
    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      if (position) {
        const newPosition = { lat: position.lat(), lng: position.lng() };
        setSelectedPosition(newPosition);
        mapInstance.panTo(position);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [scriptLoaded, initialPosition, resolvedTheme]);

  // Update map styles when theme changes
  useEffect(() => {
    if (map) {
      map.setOptions({
        styles: resolvedTheme === "dark" ? darkMapStyle : lightMapStyle,
      });
    }
  }, [map, resolvedTheme]);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const google = (window as any).google;

      // Check if Geocoder is available
      if (!google || !google.maps || !google.maps.Geocoder) {
        console.warn("Geocoding service not available, showing coordinates instead");
        setSelectedAddress(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLoadingAddress(false);
        return;
      }

      const geocoder = new google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setSelectedAddress(results[0].formatted_address);
        } else {
          console.warn("Geocoding failed:", status);
          setSelectedAddress(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        setLoadingAddress(false);
      });
    } catch (error) {
      console.error("Error getting address:", error);
      setSelectedAddress(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setLoadingAddress(false);
    }
  };

  // Update address when position changes
  useEffect(() => {
    if (selectedPosition && scriptLoaded) {
      getAddressFromCoordinates(selectedPosition.lat, selectedPosition.lng);
    }
  }, [selectedPosition, scriptLoaded]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !map || !marker) {
      return;
    }

    setLoadingCurrentLocation(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(newPosition);
        map.setZoom(15);
        marker.setPosition(newPosition);
        setSelectedPosition(newPosition);

        // Lưu vị trí hiện tại vào API luôn
        onLocationSelected(newPosition.lat, newPosition.lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoadingCurrentLocation(false);
        setLoading(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedPosition) return;

    setLoading(true);
    await onLocationSelected(selectedPosition.lat, selectedPosition.lng);
    setLoading(false);
  };

  if (!scriptLoaded || !initialPosition) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loading size="lg" variant="spinner" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang lấy vị trí của bạn...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl" />
      </div>

      {/* Location Selector Card */}
      <div className="relative w-full max-w-4xl">
        <div className="rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chọn vị trí của bạn</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Nhấp vào bản đồ hoặc kéo marker để chọn vị trí chính xác
            </p>
          </div>

          {/* Map Container */}
          <div className="mb-6">
            <div ref={mapRef} className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700" />
          </div>

          {/* Selected Address Display */}
          {selectedPosition && (
            <div className="mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vị trí đã chọn:{" "}
                {loadingAddress ? (
                  <span className="text-gray-500 dark:text-gray-400">Đang tìm địa chỉ...</span>
                ) : (
                  <span className="text-blue-600">{selectedAddress || "Không tìm thấy địa chỉ"}</span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              fullWidth
              variant="light"
              onClick={handleUseCurrentLocation}
              disabled={loadingCurrentLocation || loading}
              className="h-12 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingCurrentLocation || loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size="sm" variant="spinner" />
                  <span>Đang xác nhận...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Navigation className="h-5 w-5" />
                  <span>Dùng vị trí hiện tại & Xác nhận</span>
                </div>
              )}
            </Button>

            <Button
              fullWidth
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedPosition || loading}
              className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loading size="md" variant="spinner" /> : "Lưu vị trí đã chọn"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationView;
