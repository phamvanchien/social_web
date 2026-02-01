"use client";

import { updateUserLocation } from "@/api/user.api";
import LocationView from "@/views/login/LocationView";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { BaseResponseType } from "@/types/base.type";
import { useState } from "react";
import { getCookie, setCookie } from "@/utils/cookie.utils";
import { APP_CONFIG } from "@/config/app.config";

const LocationPage = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleLocationSelected = async (lat: number, lng: number) => {
    try {
      const response = await updateUserLocation({ lat, long: lng });

      if (response && response.code === API_CODE.OK) {
        // Cập nhật cookie user với thông tin location mới
        const userCookie = getCookie(APP_AUTH.COOKIE_AUTH_USER);
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          userData.lat = lat;
          userData.long = lng;

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

  return <LocationView onLocationSelected={handleLocationSelected} />;
};

export default LocationPage;
