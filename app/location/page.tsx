"use client";

import { updateUserWard } from "@/api/user.api";
import { Ward } from "@/api/region.api";
import WardSelectionView from "@/views/location/WardSelectionView";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { BaseResponseType } from "@/types/base.type";
import { useState, useEffect } from "react";
import { getCookie, setCookie } from "@/utils/cookie.utils";
import { APP_CONFIG } from "@/config/app.config";

const LocationPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMessage, setErrorMessage] = useState<string>();
  const [defaultWardId, setDefaultWardId] = useState<number | undefined>();

  useEffect(() => {
    // Lấy ward_id hiện tại của user từ cookie
    const userCookie = getCookie(APP_AUTH.COOKIE_AUTH_USER);
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        if (userData.ward_id) {
          setDefaultWardId(userData.ward_id);
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, []);

  const handleWardSelected = async (ward: Ward) => {
    try {
      const response = await updateUserWard({
        provinceId: ward.provinceId,
        wardId: ward.id
      });

      if (response && response.code === API_CODE.OK) {
        // Cập nhật cookie user với thông tin ward mới
        const userCookie = getCookie(APP_AUTH.COOKIE_AUTH_USER);
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          userData.province_id = ward.provinceId;
          userData.ward_id = ward.id;
          userData.province_name = ward.province?.name || "TP. Hồ Chí Minh";
          userData.ward_name = ward.name;
          userData.ward_type = ward.type;

          setCookie(APP_AUTH.COOKIE_AUTH_USER, JSON.stringify(userData), {
            expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
            path: '/',
            sameSite: 'lax',
            secure: true
          });
        }

        // Redirect về trang chủ
        window.location.href = "/";
      } else {
        setErrorMessage(response.error?.message || APP_ERROR.SERVER_ERROR);
      }
    } catch (error) {
      setErrorMessage((error as BaseResponseType).error?.message as string || APP_ERROR.SERVER_ERROR);
    }
  };

  return <WardSelectionView onWardSelected={handleWardSelected} defaultWardId={defaultWardId} />;
};

export default LocationPage;
