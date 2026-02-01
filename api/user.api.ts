import { request } from "./base.api";
import { API_METHOD } from "@/enums/api.enum";
import { APP_CONFIG } from "@/config/app.config";
import { BaseResponseType } from "@/types/base.type";

export interface UpdateLocationPayload {
  lat: number;
  long: number;
}

export const updateUserLocation = async (payload: UpdateLocationPayload): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.user + '/location',
    data: payload
  });
}
