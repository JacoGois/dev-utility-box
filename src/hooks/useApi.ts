import { AxiosResponse } from "axios";
import { useState } from "react";

type errorType = {
  response: AxiosResponse;
};

export type metaPaginationType = {
  pagination: {
    count: number;
    current: number;
    pagesCount: number;
    perPage: number;
    recordsCount: number;
  };
};

type requesterType = (...args: object[]) => Promise<AxiosResponse>;

export const useApi = <T, E = unknown>(requester: requesterType) => {
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [meta, setMeta] = useState<object | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = async (...args: object[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await requester(...args);
      setData(result.data);
      setStatus(result.data.status);
      setStatusCode(result.status);
      setMeta(result.data.meta);
      return result;
    } catch (err: unknown) {
      const apiError = err as errorType;
      if (!apiError.response) throw err as E;

      setStatus(apiError.response.data.status);
      setError(apiError.response.data.data);
      setMeta(apiError.response.data.meta);
      setStatusCode(apiError.response.status);
      throw apiError.response.data.data as E;
    } finally {
      setLoading(false);
    }
  };

  return {
    data: data as T,
    status,
    statusCode,
    meta: meta as metaPaginationType,
    error: error as E,
    loading,
    makeRequest: makeRequest as (
      ...args: object[]
    ) => Promise<AxiosResponse<T>>,
  };
};
