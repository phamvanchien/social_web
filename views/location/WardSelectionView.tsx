"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Search, Building2 } from "lucide-react";
import { getAllWards, Ward } from "@/api/region.api";
import { API_CODE } from "@/enums/api.enum";
import Loading from "@/components/common/Loading";
import Input from "@/components/common/Input";

const GOOGLE_MAPS_API_KEY = "AIzaSyCX7Yx5-P_1m7tuM-P9zIk-EOhcad-XoeA";
const DEFAULT_WARD_ID = 1; // Phường mặc định nếu không lấy được vị trí

interface WardSelectionViewProps {
  onWardSelected: (ward: Ward) => Promise<void>;
  defaultWardId?: number;
}

const WardSelectionView = ({ onWardSelected, defaultWardId }: WardSelectionViewProps) => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedWardRef = useRef<HTMLButtonElement>(null);

  // Function to find ward by name from geocoding result
  const findWardByName = (wardList: Ward[], addressComponents: string[]): Ward | null => {
    for (const component of addressComponents) {
      const normalizedComponent = component.toLowerCase().trim();

      for (const ward of wardList) {
        const wardName = ward.name.toLowerCase();
        if (normalizedComponent.includes(wardName) || wardName.includes(normalizedComponent)) {
          return ward;
        }
        if (ward.oldDescription) {
          const oldDesc = ward.oldDescription.toLowerCase();
          if (oldDesc.includes(normalizedComponent)) {
            return ward;
          }
        }
      }
    }
    return null;
  };

  // Function to detect user location and find matching ward
  const detectUserLocation = (wardList: Ward[]): Promise<Ward | null> => {
    if (!navigator.geolocation) {
      return Promise.resolve(null);
    }

    return new Promise<Ward | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=vi&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              const addressComponents: string[] = [];
              for (const result of data.results) {
                for (const component of result.address_components) {
                  addressComponents.push(component.long_name);
                  addressComponents.push(component.short_name);
                }
              }

              const matchedWard = findWardByName(wardList, addressComponents);
              resolve(matchedWard);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error("Error geocoding:", error);
            resolve(null);
          }
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getAllWards();
        if (response && response.code === API_CODE.OK) {
          const wardList = response.data;
          setWards(wardList);
          setFilteredWards(wardList);

          // Ưu tiên 1: Nếu có wardId trong cookie → dùng luôn
          if (defaultWardId) {
            const defaultWard = wardList.find((w: Ward) => w.id === defaultWardId);
            if (defaultWard) {
              setSelectedWard(defaultWard);
              setLoading(false);
              return;
            }
          }

          // Ưu tiên 2: Lấy từ GPS location
          const detectedWard = await detectUserLocation(wardList);
          if (detectedWard) {
            setSelectedWard(detectedWard);
            setLoading(false);
            return;
          }

          // Ưu tiên 3: Dùng phường mặc định
          const fallbackWard = wardList.find((w: Ward) => w.id === DEFAULT_WARD_ID) || wardList[0];
          if (fallbackWard) {
            setSelectedWard(fallbackWard);
          }
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, [defaultWardId]);

  // Scroll to selected ward when it's auto-selected
  useEffect(() => {
    if (selectedWard && selectedWardRef.current) {
      setTimeout(() => {
        selectedWardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [selectedWard?.id]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWards(wards);
    } else {
      const filtered = wards.filter(
        (ward) =>
          ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ward.oldDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWards(filtered);
    }
  }, [searchTerm, wards]);

  const handleWardClick = (ward: Ward) => {
    setSelectedWard(ward);
  };

  const handleConfirm = async () => {
    if (selectedWard) {
      setSubmitting(true);
      try {
        await onWardSelected(selectedWard);
      } catch (error) {
        console.error("Error selecting ward:", error);
        setSubmitting(false);
      }
    }
  };

  // Group wards by type
  const phuongWards = filteredWards.filter((w) => w.type === "phường");
  const xaWards = filteredWards.filter((w) => w.type === "xã");

  if (loading) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loading size="lg" variant="spinner" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Đang tải danh sách khu vực...
          </p>
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

      {/* Ward Selection Card */}
      <div className="relative w-full max-w-4xl">
        <div className="rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Chọn khu vực của bạn
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              TP. Hồ Chí Minh - Chọn phường/xã nơi bạn sinh sống
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm phường/xã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 transition focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
            />
          </div>

          {/* Wards Grid */}
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {/* Phường Section */}
            {phuongWards.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Phường ({phuongWards.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {phuongWards.map((ward) => (
                    <button
                      key={ward.id}
                      ref={selectedWard?.id === ward.id ? selectedWardRef : null}
                      onClick={() => handleWardClick(ward)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedWard?.id === ward.id
                          ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow"
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{ward.name}</p>
                      <p
                        className={`text-xs mt-1 truncate ${
                          selectedWard?.id === ward.id
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {ward.type}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Xã Section */}
            {xaWards.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Xã ({xaWards.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {xaWards.map((ward) => (
                    <button
                      key={ward.id}
                      ref={selectedWard?.id === ward.id ? selectedWardRef : null}
                      onClick={() => handleWardClick(ward)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedWard?.id === ward.id
                          ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow"
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{ward.name}</p>
                      <p
                        className={`text-xs mt-1 truncate ${
                          selectedWard?.id === ward.id
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {ward.type}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredWards.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Không tìm thấy khu vực phù hợp
              </div>
            )}
          </div>

          {/* Selected Ward Info */}
          {selectedWard && (
            <div className="mt-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Khu vực đã chọn:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {selectedWard.type} {selectedWard.name}
                </span>
              </p>
              {selectedWard.oldDescription && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedWard.oldDescription}
                </p>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedWard || submitting}
            className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loading size="sm" variant="spinner" />
                <span>Đang xác nhận...</span>
              </div>
            ) : (
              "Xác nhận khu vực"
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default WardSelectionView;
