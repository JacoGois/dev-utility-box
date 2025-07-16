"use client";

import { AUTH_TOKEN_KEY } from "@/lib/constants";
import axios, { AxiosResponse } from "axios";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

httpClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const fakeRequest = (
  data = {},
  time = 1500,
  meta: unknown | [] = [],
  status = "success"
) => {
  const response = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status,
        data: {
          meta,
          data,
        },
      });
    }, time);
  });

  return response as Promise<AxiosResponse>;
};

export default httpClient;
