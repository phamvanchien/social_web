import { request } from "./base.api";
import { API_METHOD } from "@/enums/api.enum";
import { APP_CONFIG } from "@/config/app.config";
import { BaseResponseType } from "@/types/base.type";

export interface Province {
  id: number;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ward {
  id: number;
  name: string;
  type: string;
  oldDescription?: string;
  provinceId: number;
  province?: Province;
  createdAt: string;
  updatedAt: string;
}

export const getProvinces = async (): Promise<BaseResponseType<Province[]>> => {
  return request({
    method: API_METHOD.GET,
    url: APP_CONFIG.API.PREFIX.regions + '/provinces'
  });
}

export const getWardsByProvince = async (provinceId: number): Promise<BaseResponseType<Ward[]>> => {
  return request({
    method: API_METHOD.GET,
    url: APP_CONFIG.API.PREFIX.regions + `/provinces/${provinceId}/wards`
  });
}

export const getAllWards = async (): Promise<BaseResponseType<Ward[]>> => {
  return request({
    method: API_METHOD.GET,
    url: APP_CONFIG.API.PREFIX.regions + '/wards'
  });
}
