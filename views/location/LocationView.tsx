"use client";

// import { useEffect, useMemo, useState } from "react";

// type Province = { code: number; name: string };
// type District = { code: number; name: string };
// type Ward = { code: number; name: string };

// type Step = "detecting" | "confirm" | "manual" | "saving" | "done" | "error";

const LocationView = () => {
  // const [step, setStep] = useState<Step>("detecting");

  // // Geolocation
  // const [lat, setLat] = useState<number | null>(null);
  // const [lng, setLng] = useState<number | null>(null);
  // const [autoAddress, setAutoAddress] = useState<string>("");

  // // Manual selects
  // const [provinces, setProvinces] = useState<Province[]>([]);
  // const [districts, setDistricts] = useState<District[]>([]);
  // const [wards, setWards] = useState<Ward[]>([]);

  // const [provinceCode, setProvinceCode] = useState<number | "">("");
  // const [districtCode, setDistrictCode] = useState<number | "">("");
  // const [wardCode, setWardCode] = useState<number | "">("");

  // const [error, setError] = useState<string | null>(null);
  // const [note, setNote] = useState<string>(""); // ghi chú địa chỉ cụ thể (số nhà, hẻm...)

  // // ===== Helpers to fetch VN administrative units =====
  // const fetchProvinces = async () => {
  //   const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
  //   const data = (await res.json()) as { code: number; name: string }[];
  //   setProvinces(
  //     data
  //       .map((p) => ({ code: p.code, name: p.name }))
  //       .sort((a, b) => a.name.localeCompare(b.name, "vi"))
  //   );
  // };

  // const fetchDistrictsAndWardsByProvince = async (pCode: number) => {
  //   // depth=2 trả về province + districts kèm wards trong mỗi district
  //   const res = await fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
  //   const data = await res.json();
  //   const dists: District[] = (data.districts || []).map((d: any) => ({
  //     code: d.code,
  //     name: d.name,
  //   }));
  //   setDistricts(dists.sort((a, b) => a.name.localeCompare(b.name, "vi")));
  //   setWards([]); // reset wards
  // };

  // const fetchWardsByDistrict = async (dCode: number) => {
  //   // depth=2 trả về district + wards
  //   const res = await fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
  //   const data = await res.json();
  //   const ws: Ward[] = (data.wards || []).map((w: any) => ({
  //     code: w.code,
  //     name: w.name,
  //   }));
  //   setWards(ws.sort((a, b) => a.name.localeCompare(b.name, "vi")));
  // };

  // const selectedProvince = useMemo(
  //   () => provinces.find((p) => p.code === provinceCode),
  //   [provinceCode, provinces]
  // );
  // const selectedDistrict = useMemo(
  //   () => districts.find((d) => d.code === districtCode),
  //   [districtCode, districts]
  // );
  // const selectedWard = useMemo(() => wards.find((w) => w.code === wardCode), [wardCode, wards]);

  // // ===== Detect location on mount =====
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       await fetchProvinces();
  //     } catch (e) {
  //       // vẫn cho phép user nhập tay nếu API tỉnh/thành lỗi
  //     }

  //     if (!("geolocation" in navigator)) {
  //       setStep("manual");
  //       return;
  //     }

  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         const { latitude, longitude } = pos.coords;
  //         setLat(latitude);
  //         setLng(longitude);

  //         try {
  //           // Reverse geocoding (Nominatim)
  //           const res = await fetch(
  //             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  //           );
  //           const data = await res.json();
  //           if (data?.display_name) {
  //             setAutoAddress(data.display_name);
  //             setStep("confirm");
  //           } else {
  //             setStep("manual");
  //           }
  //         } catch {
  //           setStep("manual");
  //         }
  //       },
  //       () => {
  //         // user deny hoặc lỗi → chọn thủ công
  //         setStep("manual");
  //       },
  //       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  //     );
  //   };

  //   init();
  // }, []);

  // // ===== Handlers =====
  // const handleConfirmYes = async () => {
  //   // Save with lat/lng + autoAddress
  //   try {
  //     setStep("saving");
  //     await saveLocation({
  //       mode: "auto",
  //       address: autoAddress,
  //       province: null,
  //       district: null,
  //       ward: null,
  //       note: null,
  //       lat,
  //       lng,
  //     });
  //     setStep("done");
  //   } catch (e: any) {
  //     setError(e?.message || "Không thể lưu vị trí.");
  //     setStep("error");
  //   }
  // };

  // const handleConfirmNo = () => {
  //   setStep("manual");
  // };

  // const onSelectProvince = async (val: string) => {
  //   const code = Number(val);
  //   setProvinceCode(isNaN(code) ? "" : code);
  //   setDistrictCode("");
  //   setWardCode("");
  //   setWards([]);
  //   if (!isNaN(code)) {
  //     try {
  //       await fetchDistrictsAndWardsByProvince(code);
  //     } catch {
  //       // ignore
  //     }
  //   } else {
  //     setDistricts([]);
  //   }
  // };

  // const onSelectDistrict = async (val: string) => {
  //   const code = Number(val);
  //   setDistrictCode(isNaN(code) ? "" : code);
  //   setWardCode("");
  //   if (!isNaN(code)) {
  //     try {
  //       await fetchWardsByDistrict(code);
  //     } catch {
  //       // ignore
  //     }
  //   } else {
  //     setWards([]);
  //   }
  // };

  // const onSelectWard = (val: string) => {
  //   const code = Number(val);
  //   setWardCode(isNaN(code) ? "" : code);
  // };

  // const handleSaveManual = async () => {
  //   if (!provinceCode || !districtCode || !wardCode) {
  //     setError("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã.");
  //     return;
  //   }
  //   setError(null);
  //   try {
  //     setStep("saving");
  //     const composedAddress = [
  //       note?.trim(),
  //       selectedWard?.name,
  //       selectedDistrict?.name,
  //       selectedProvince?.name,
  //     ]
  //       .filter(Boolean)
  //       .join(", ");

  //     await saveLocation({
  //       mode: "manual",
  //       address: composedAddress,
  //       province: selectedProvince?.name || null,
  //       district: selectedDistrict?.name || null,
  //       ward: selectedWard?.name || null,
  //       note: note || null,
  //       // Nếu user deny location, lat/lng sẽ null
  //       lat,
  //       lng,
  //     });

  //     setStep("done");
  //   } catch (e: any) {
  //     setError(e?.message || "Không thể lưu vị trí.");
  //     setStep("error");
  //   }
  // };

  // // ===== Mock Save API (bạn thay bằng API thật của bạn) =====
  // async function saveLocation(payload: {
  //   mode: "auto" | "manual";
  //   address: string | null;
  //   province: string | null;
  //   district: string | null;
  //   ward: string | null;
  //   note: string | null;
  //   lat: number | null;
  //   lng: number | null;
  // }) {
  //   // Thay bằng API nội bộ của bạn:
  //   // return fetch("/api/user/location", { method: "POST", body: JSON.stringify(payload) })

  //   // Demo delay:
  //   await new Promise((r) => setTimeout(r, 700));
  //   return true;
  // }

  // return (
  //   <main className="min-h-screen bg-white relative overflow-hidden">
  //     <div className="pointer-events-none absolute inset-0">
  //       <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-50 blur-3xl" />
  //       <div className="absolute top-40 -right-10 h-80 w-80 rounded-full bg-indigo-50/70 blur-3xl" />
  //     </div>

  //     <section className="mx-auto min-h-screen max-w-xl flex items-center">
  //       <div className="w-full">
  //         <div className="rounded-2xl p-4">
  //           <header className="mb-6 flex items-center gap-3">
  //             <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  //                 <path strokeWidth="1.8" d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
  //                 <circle cx="12" cy="10" r="3" strokeWidth="1.8" />
  //               </svg>
  //             </div>
  //             <div>
  //               <h1 className="text-xl font-semibold text-zinc-900">Địa chỉ của bạn</h1>
  //               <p className="text-sm text-zinc-500">Giúp chúng tôi xác định vị trí chính xác.</p>
  //             </div>
  //           </header>

  //           {step === "detecting" && (
  //             <div className="py-10 flex flex-col items-center gap-4">
  //               <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
  //               <p className="text-zinc-700">Đang kiểm tra quyền truy cập vị trí…</p>
  //             </div>
  //           )}

  //           {step === "confirm" && (
  //             <div className="space-y-5">
  //               <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
  //                 <p className="text-sm text-zinc-500 mb-1">Địa chỉ phát hiện được</p>
  //                 <p className="text-zinc-900">{autoAddress}</p>
  //                 {lat && lng && (
  //                   <p className="mt-2 text-xs text-zinc-500">
  //                     (lat: {lat.toFixed(6)}, lng: {lng.toFixed(6)})
  //                   </p>
  //                 )}
  //               </div>

  //               <p className="text-zinc-800 font-medium">Đây có phải là địa chỉ của bạn không?</p>

  //               <div className="flex flex-col sm:flex-row gap-3">
  //                 <button
  //                   onClick={handleConfirmYes}
  //                   className="inline-flex items-center justify-center rounded-lg bg-[#0C8BDA] px-4 py-2.5 text-white font-medium hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0C8BDA]"
  //                 >
  //                   Có, lưu địa chỉ này
  //                 </button>
  //                 <button
  //                   onClick={handleConfirmNo}
  //                   className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-800 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-zinc-300"
  //                 >
  //                   Không, tôi sẽ chọn thủ công
  //                 </button>
  //               </div>
  //             </div>
  //           )}

  //           {step === "manual" && (
  //             <div className="space-y-5">
  //               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  //                 <div>
  //                   <label className="mb-1 block text-sm text-zinc-600">Tỉnh/Thành phố</label>
  //                   <select
  //                     value={provinceCode}
  //                     onChange={(e) => onSelectProvince(e.target.value)}
  //                     className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0C8BDA]"
  //                   >
  //                     <option value="">Chọn Tỉnh/Thành…</option>
  //                     {provinces.map((p) => (
  //                       <option key={p.code} value={p.code}>
  //                         {p.name}
  //                       </option>
  //                     ))}
  //                   </select>
  //                 </div>

  //                 <div>
  //                   <label className="mb-1 block text-sm text-zinc-600">Quận/Huyện</label>
  //                   <select
  //                     value={districtCode}
  //                     onChange={(e) => onSelectDistrict(e.target.value)}
  //                     disabled={!provinceCode}
  //                     className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0C8BDA]"
  //                   >
  //                     <option value="">Chọn Quận/Huyện…</option>
  //                     {districts.map((d) => (
  //                       <option key={d.code} value={d.code}>
  //                         {d.name}
  //                       </option>
  //                     ))}
  //                   </select>
  //                 </div>

  //                 <div>
  //                   <label className="mb-1 block text-sm text-zinc-600">Phường/Xã</label>
  //                   <select
  //                     value={wardCode}
  //                     onChange={(e) => onSelectWard(e.target.value)}
  //                     disabled={!districtCode}
  //                     className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0C8BDA]"
  //                   >
  //                     <option value="">Chọn Phường/Xã…</option>
  //                     {wards.map((w) => (
  //                       <option key={w.code} value={w.code}>
  //                         {w.name}
  //                       </option>
  //                     ))}
  //                   </select>
  //                 </div>
  //               </div>

  //               <div>
  //                 <label className="mb-1 block text-sm text-zinc-600">Số nhà, đường (tuỳ chọn)</label>
  //                 <input
  //                   value={note}
  //                   onChange={(e) => setNote(e.target.value)}
  //                   placeholder="Ví dụ: 12/3 Nguyễn Trãi, phường 1"
  //                   className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0C8BDA]"
  //                 />
  //               </div>

  //               {error && <p className="text-sm text-red-600">{error}</p>}

  //               <div className="flex flex-col sm:flex-row gap-3">
  //                 <button
  //                   onClick={handleSaveManual}
  //                   className="inline-flex items-center justify-center rounded-lg bg-[#0C8BDA] px-4 py-2.5 text-white font-medium hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0C8BDA]"
  //                 >
  //                   Lưu địa chỉ
  //                 </button>

  //                 {/* Gợi ý quay lại dùng vị trí thiết bị nếu trước đó deny */}
  //                 {"geolocation" in navigator && lat === null && lng === null && (
  //                   <button
  //                     onClick={() => setStep("detecting")}
  //                     className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-800 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-zinc-300"
  //                   >
  //                     Dùng vị trí hiện tại
  //                   </button>
  //                 )}
  //               </div>
  //             </div>
  //           )}

  //           {/* Saving */}
  //           {step === "saving" && (
  //             <div className="py-10 flex flex-col items-center gap-4">
  //               <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
  //               <p className="text-zinc-700">Đang lưu địa chỉ…</p>
  //             </div>
  //           )}

  //           {/* Done */}
  //           {step === "done" && (
  //             <div className="py-8 text-center space-y-3">
  //               <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
  //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  //                   <path strokeWidth="2" d="m5 13 4 4L19 7" />
  //                 </svg>
  //               </div>
  //               <h3 className="text-lg font-semibold text-zinc-900">Đã lưu địa chỉ thành công</h3>
  //               <p className="text-sm text-zinc-500">
  //                 Bạn có thể thay đổi địa chỉ trong phần hồ sơ bất cứ lúc nào.
  //               </p>
  //             </div>
  //           )}

  //           {/* Error */}
  //           {step === "error" && (
  //             <div className="py-8 text-center space-y-3">
  //               <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
  //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  //                   <path strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  //                 </svg>
  //               </div>
  //               <h3 className="text-lg font-semibold text-zinc-900">Có lỗi xảy ra</h3>
  //               <p className="text-sm text-zinc-500">{error || "Vui lòng thử lại."}</p>
  //               <div className="pt-2">
  //                 <button
  //                   onClick={() => setStep("manual")}
  //                   className="inline-flex items-center justify-center rounded-lg bg-[#0C8BDA] px-4 py-2.5 text-white font-medium hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0C8BDA]"
  //                 >
  //                   Chọn địa chỉ thủ công
  //                 </button>
  //               </div>
  //             </div>
  //           )}
  //         </div>

  //         {/* Footer hint */}
  //         <p className="mt-4 text-center text-xs text-zinc-500">
  //           * Khi lưu tự động, chúng tôi sẽ lưu kèm toạ độ (lat/lng) nếu bạn cho phép quyền vị trí.
  //         </p>
  //       </div>
  //     </section>
  //   </main>
  // );
  return <></>
};

export default LocationView;