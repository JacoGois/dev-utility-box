import { getEndpoint } from "@/endpoints";
import { useApi } from "@/hooks/useApi";
import httpClient from "@/utils/httpClient";

export interface LoginResponse {
  token: string;
}

export function useLogin() {
  return useApi<LoginResponse>((values) => {
    const { method, route } = getEndpoint("login");
    return httpClient[method](route, values);
  });
}

export interface RegisterResponse {
  token: string;
}

export function useRegister() {
  return useApi<RegisterResponse>((values) => {
    const { method, route } = getEndpoint("register");
    return httpClient[method](route, values);
  });
}
