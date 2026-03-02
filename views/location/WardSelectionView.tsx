"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapPin, Search, Crosshair, X, ChevronLeft, ChevronRight, Shield, Check } from "lucide-react";
import { getAllWards, Ward, reverseGeocode } from "@/api/region.api";
import { API_CODE } from "@/enums/api.enum";
import Loading from "@/components/common/Loading";

const LOCATION_CACHE_KEY = 'lacial_detected_location';
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

interface DetectedLocation {
  ward?: string;
  district?: string;
  city?: string;
  displayName: string; // Build từ [ward, district, city].filter(Boolean).join(', ')
  fromCache?: boolean;
}

interface CachedLocation {
  lat: number;
  lon: number;
  detectedLocation: DetectedLocation;
  matchedWardName?: string;
  timestamp: number;
}

// Helper functions
const saveLocationToCache = (data: Omit<CachedLocation, 'timestamp'>) => {
  try {
    const cacheData: CachedLocation = { ...data, timestamp: Date.now() };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving location to cache:', error);
  }
};

const getLocationFromCache = (): CachedLocation | null => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;
    const data: CachedLocation = JSON.parse(cached);
    if (Date.now() - data.timestamp > LOCATION_CACHE_EXPIRY) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error reading location from cache:', error);
    return null;
  }
};

interface WardSelectionViewProps {
  onWardSelected: (ward: Ward) => Promise<void>;
  defaultWardId?: number;
  onSkip?: () => void;
}

const WardSelectionView = ({ onWardSelected, defaultWardId, onSkip }: WardSelectionViewProps) => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardSearch, setWardSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const selectedWardRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter wards by wardSearch — flat list, no grouping
  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return wards;
    const term = wardSearch.toLowerCase();
    return wards.filter(ward => ward.name.toLowerCase().includes(term));
  }, [wards, wardSearch]);

  // Loại bỏ prefix hành chính để so sánh chính xác hơn
  const normalizeLocationName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/^(phường|xã|thị trấn|quận|huyện|thành phố|tp\.?)\s+/i, '')
      .trim();
  };

  // Kiểm tra 2 tên có tương đương không (cho phép sai lệch nhỏ như dấu, khoảng trắng)
  const isNameMatch = (name1: string, name2: string): boolean => {
    // Exact match
    if (name1 === name2) return true;

    // Nếu độ dài chênh lệch quá nhiều (> 3 ký tự), không match
    // Tránh "An Nhơn" match với "An Nhơn Tây"
    if (Math.abs(name1.length - name2.length) > 3) return false;

    // Chỉ match nếu một trong hai chứa hoàn toàn tên kia VÀ độ dài gần bằng nhau
    if (name1.includes(name2) || name2.includes(name1)) {
      return true;
    }

    return false;
  };

  const findWardByName = (wardList: Ward[], addressComponents: string[]): Ward | null => {
    const [wardComponent] = addressComponents;

    if (wardComponent) {
      const normalizedWard = normalizeLocationName(wardComponent);

      // Tìm exact match trước (ưu tiên cao nhất)
      for (const ward of wardList) {
        const wardName = normalizeLocationName(ward.name);
        if (normalizedWard === wardName) {
          return ward;
        }
      }

      // Tìm match gần đúng trong tên (với kiểm tra độ dài)
      for (const ward of wardList) {
        const wardName = normalizeLocationName(ward.name);
        if (isNameMatch(normalizedWard, wardName)) {
          return ward;
        }
      }
    }

    // Không match theo district - chỉ match theo tên phường từ GPS
    // Nếu phường GPS không có trong database, trả về null để user chọn thủ công
    return null;
  };

  // GPS detect → thành công: hiện địa chỉ, thất bại: chuyển sang chọn thủ công
  const detectUserLocation = (): Promise<void> => {
    if (!navigator.geolocation) {
      setCurrentStep(2);
      return Promise.resolve();
    }

    setDetectingLocation(true);

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const response = await reverseGeocode(latitude, longitude);

            if (response?.data) {
              const { ward: wardName, district: districtName, city: cityName } = response.data;

              const displayName = [wardName, districtName, cityName]
                .filter(Boolean)
                .join(', ');

              const detectedLoc: DetectedLocation = {
                ward: wardName || '',
                district: districtName || '',
                city: cityName || '',
                displayName
              };

              setDetectedLocation(detectedLoc);

              const addressComponents: string[] = [
                wardName, districtName, cityName
              ].filter(Boolean) as string[];

              const matchedWard = findWardByName(wards, addressComponents);

              saveLocationToCache({
                lat: latitude, lon: longitude,
                detectedLocation: detectedLoc,
                matchedWardName: matchedWard?.name
              });

              console.log("[GPS] Thành công - reverse geocode OK", detectedLoc);
              setDetectingLocation(false);
              resolve();
            } else {
              console.log("[GPS] Fail - reverse geocode trả null, response:", response);
              setDetectingLocation(false);
              setCurrentStep(2);
              resolve();
            }
          } catch (error) {
            console.log("[GPS] Fail - reverse geocode throw error:", error);
            setDetectingLocation(false);
            setCurrentStep(2);
            resolve();
          }
        },
        (error) => {
          console.log("[GPS] Fail - geolocation error:", error.code, error.message);
          const cached = getLocationFromCache();
          if (cached) {
            console.log("[GPS] Fallback cache OK", cached.detectedLocation);
            setDetectedLocation(ensureDisplayName({ ...cached.detectedLocation, fromCache: true }));
            setDetectingLocation(false);
            resolve();
            return;
          }
          console.log("[GPS] Fail - không có cache, chuyển step 2");
          setDetectingLocation(false);
          setCurrentStep(2);
          resolve();
        },
        { timeout: 15000, enableHighAccuracy: false, maximumAge: 600000 }
      );
    });
  };

  // Rebuild displayName từ cache cũ nếu bị rỗng
  const ensureDisplayName = (loc: DetectedLocation): DetectedLocation => {
    if (loc.displayName) return loc;
    return {
      ...loc,
      displayName: [loc.ward, loc.district, loc.city].filter(Boolean).join(', ')
    };
  };

  // GPS button handler: check cache first, then call GPS detect
  const handleGpsClick = async () => {
    const cached = getLocationFromCache();
    if (cached) {
      setDetectedLocation(ensureDisplayName({ ...cached.detectedLocation, fromCache: true }));
      return;
    }
    await detectUserLocation();
  };

  // Manual selection button handler: navigate to step 2
  const handleManualClick = () => {
    setCurrentStep(2);
  };

  // Back button handler: return to step 1, clear ward search
  const handleBack = () => {
    setCurrentStep(1);
    setWardSearch("");
  };

  // Continue/confirm handler for both steps
  const handleContinue = () => {
    if (currentStep === 1 && detectedLocation) {
      // Pre-select ward matching GPS result
      const addressComponents = [
        detectedLocation.ward,
        detectedLocation.district,
        detectedLocation.city
      ].filter(Boolean) as string[];
      const matchedWard = findWardByName(wards, addressComponents);
      if (matchedWard) setSelectedWard(matchedWard);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleConfirm();
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getAllWards();
        if (response && response.code === API_CODE.OK) {
          const wardList = response.data;
          setWards(wardList);

          // Nếu có defaultWardId → pre-navigate sang Step 2
          if (defaultWardId) {
            const defaultWard = wardList.find((w: Ward) => w.id === defaultWardId);
            if (defaultWard) {
              setSelectedWard(defaultWard);
              setCurrentStep(2);
            }
          }

          // Auto detect GPS khi load trang
          if (!defaultWardId) {
            const cached = getLocationFromCache();
            if (cached) {
              setDetectedLocation(ensureDisplayName({ ...cached.detectedLocation, fromCache: true }));
            } else {
              detectUserLocation();
            }
          }
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [defaultWardId]);

  useEffect(() => {
    if (selectedWard && selectedWardRef.current) {
      setTimeout(() => {
        selectedWardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedWard?.id]);

  const handleWardClick = (ward: Ward) => setSelectedWard(ward);

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

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
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
    <section className="min-h-screen bg-white dark:bg-gray-900 relative z-10">
      <div className="flex flex-col min-h-screen">

        {/* Header */}
        <div className="pt-6 sm:pt-8 px-4 sm:px-6">
          <div className="max-w-[672px] mx-auto">
            {currentStep === 2 && detectedLocation && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-4 text-[#6B7280] dark:text-gray-400 text-sm font-medium hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Quay lại bước trước"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
            )}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] dark:text-white leading-tight mb-2">
                {currentStep === 1 ? "Bạn đang ở đâu?" : "Chọn Phường/Xã"}
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] dark:text-gray-400 leading-relaxed">
                {currentStep === 1
                  ? "Chúng tôi sẽ hiển thị bài viết và sự kiện từ khu vực của bạn"
                  : "Chọn khu vực bạn đang sinh sống"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 mt-6">
          <div className="max-w-[672px] mx-auto">

            {/* STEP 1 — Method Selection */}
            {currentStep === 1 && (
              <>
                {/* Privacy Notice */}
                <div className="flex gap-3 bg-[#F0FDF4] dark:bg-green-900/20 rounded-2xl p-4 mb-4">
                  <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                    Chỉ dùng để hiển thị nội dung phù hợp. Chúng tôi không thu thập dữ liệu cá nhân của bạn.
                  </p>
                </div>

                {/* GPS Button */}
                <button
                  onClick={handleGpsClick}
                  disabled={detectingLocation}
                  className="w-full rounded-2xl p-6 text-left bg-[#0C8BDA] mb-4 transition-all active:scale-[0.98] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Tự động xác định vị trí bằng GPS"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Crosshair className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-bold text-white mb-1.5">
                        Tự động xác định vị trí
                      </h3>
                      {detectedLocation && !detectingLocation && detectedLocation.displayName ? (
                        <p className="text-[15px] text-white/85 leading-relaxed">{detectedLocation.displayName}</p>
                      ) : detectingLocation ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span className="text-[15px] text-white/85 font-medium">Đang xác định...</span>
                        </div>
                      ) : (
                        <p className="text-[15px] text-white/85 leading-relaxed">Sử dụng vị trí GPS của thiết bị</p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Manual Button */}
                <button
                  onClick={handleManualClick}
                  className="w-full rounded-2xl p-6 text-left bg-white dark:bg-gray-800 border-2 border-[#E5E7EB] dark:border-gray-700 transition-all active:scale-[0.98] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  aria-label="Chọn vị trí thủ công"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#EBF5FF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-7 h-7 text-[#0C8BDA] dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white mb-1">Chọn vị trí thủ công</h3>
                        <p className="text-[15px] text-[#6B7280] dark:text-gray-400">Tự chọn phường/xã</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                </button>

              </>
            )}

            {/* STEP 2 — Ward Selection */}
            {currentStep === 2 && (
              <>
                {/* Search bar — sticky top */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-3 pt-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Tìm kiếm phường/xã..."
                      value={wardSearch}
                      onChange={(e) => setWardSearch(e.target.value)}
                      className="w-full rounded-xl border-none bg-[#F3F4F6] dark:bg-gray-800 py-3 pl-12 pr-4 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0C8BDA]/30"
                      aria-label="Tìm kiếm phường/xã"
                    />
                    {wardSearch && (
                      <button
                        onClick={() => {
                          setWardSearch("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Xóa tìm kiếm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section title */}
                <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-gray-200 mb-3 px-1">
                  Chọn phường/xã
                </h3>

                {/* Ward list — vertical list with dividers */}
                <div
                  ref={listContainerRef}
                  className="bg-[#F9FAFB] dark:bg-gray-800 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto overscroll-contain"
                  role="listbox"
                  aria-label="Danh sách phường/xã"
                >
                  {filteredWards.length > 0 ? (
                    filteredWards.map((ward, index) => (
                      <React.Fragment key={ward.id}>
                        <button
                          ref={selectedWard?.id === ward.id ? selectedWardRef : null}
                          onClick={() => handleWardClick(ward)}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            selectedWard?.id === ward.id
                              ? "bg-[#EFF6FF] dark:bg-blue-900/20"
                              : "hover:bg-[#F3F4F6] dark:hover:bg-gray-700 active:bg-[#E5E7EB] dark:active:bg-gray-600"
                          }`}
                          role="option"
                          aria-selected={selectedWard?.id === ward.id}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-base ${
                              selectedWard?.id === ward.id
                                ? "text-[#0C8BDA] dark:text-blue-400 font-medium"
                                : "font-normal text-[#4B5563] dark:text-gray-300"
                            }`}>
                              {ward.name}
                            </span>
                            {selectedWard?.id === ward.id && (
                              <Check className="w-5 h-5 text-[#0C8BDA] dark:text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        {index < filteredWards.length - 1 && (
                          <div className="h-px bg-[#E5E7EB] dark:bg-gray-700" />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy phường/xã phù hợp</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  )}
                </div>

                {/* Location Preview */}
                {selectedWard && (
                  <div
                    className="flex items-center gap-3 bg-[#EBF5FF] dark:bg-blue-900/20 rounded-xl p-4 mt-4"
                    style={{ animation: "fadeIn 0.3s ease-out" }}
                  >
                    <MapPin className="w-5 h-5 text-[#0C8BDA] dark:text-blue-400 flex-shrink-0" />
                    <span className="text-[15px] font-semibold text-[#0C8BDA] dark:text-blue-400">
                      {selectedWard.name}{selectedWard.province?.name ? `, ${selectedWard.province.name}` : ''}
                    </span>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* Bottom CTA — sticky bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-[#E5E7EB] dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-[672px] mx-auto sm:px-6 py-6">
            <button
              onClick={handleContinue}
              disabled={
                (currentStep === 1 && (!detectedLocation || detectingLocation)) ||
                (currentStep === 2 && (!selectedWard || submitting))
              }
              className="w-full h-14 rounded-2xl bg-[#0C8BDA] text-white text-[17px] font-bold transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loading size="sm" variant="spinner" />
                  Đang xác nhận...
                </span>
              ) : (
                "Tiếp tục"
              )}
            </button>
            {currentStep === 1 && !detectedLocation && !detectingLocation && (
              <p className="mt-3 text-center text-[13px] text-gray-400 dark:text-gray-500">
                Vui lòng chọn phương thức xác định vị trí
              </p>
            )}
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full mt-3 text-center text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Bỏ qua
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WardSelectionView;
