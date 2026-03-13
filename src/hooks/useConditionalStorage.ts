import { useAuthStore } from "@/stores/useAuthStore";
import { useCallback, useEffect, useState } from "react";

interface StorageConfig {
  key: string;
  defaultData?: unknown;
}

interface StorageStatus {
  isLoggedIn: boolean;
  hasLocalData: boolean;
  lastSync?: Date;
  pendingChanges: boolean;
}

export const useConditionalStorage = <T = unknown>(config: StorageConfig) => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<StorageStatus>({
    isLoggedIn: !!user,
    hasLocalData: false,
    pendingChanges: false,
  });

  useEffect(() => {
    setStatus((prev) => ({
      ...prev,
      isLoggedIn: !!user,
    }));
  }, [user]);

  useEffect(() => {
    const hasData = localStorage.getItem(config.key) !== null;
    setStatus((prev) => ({
      ...prev,
      hasLocalData: hasData,
    }));
  }, [config.key]);

  const saveLocal = useCallback(
    async (data: T): Promise<void> => {
      try {
        localStorage.setItem(
          config.key,
          JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            version: "1.0",
          })
        );

        setStatus((prev) => ({
          ...prev,
          hasLocalData: true,
          pendingChanges: !prev.isLoggedIn,
        }));

        console.log(`[${config.key}] Data saved locally`);
      } catch (error) {
        console.error(`[${config.key}] Error saving locally:`, error);
        throw error;
      }
    },
    [config.key]
  );

  const loadLocal = useCallback(async (): Promise<T | null> => {
    try {
      const stored = localStorage.getItem(config.key);
      if (!stored) {
        return (config.defaultData as T) || null;
      }

      const parsed = JSON.parse(stored);
      return (parsed.data as T) || (config.defaultData as T) || null;
    } catch (error) {
      console.error(`[${config.key}] Error loading local data:`, error);
      return (config.defaultData as T) || null;
    }
  }, [config.key]);

  const clearLocal = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem(config.key);
      setStatus((prev) => ({
        ...prev,
        hasLocalData: false,
        pendingChanges: false,
      }));
      console.log(`[${config.key}] Local data cleared`);
    } catch (error) {
      console.error(`[${config.key}] Error clearing local data:`, error);
      throw error;
    }
  }, [config.key]);

  const syncToAPI = useCallback(
    async (apiCall: () => Promise<unknown>): Promise<unknown> => {
      if (!status.isLoggedIn) {
        console.log(`[${config.key}] Sync skipped - user not logged in`);
        return null;
      }

      try {
        const result = await apiCall();

        setStatus((prev) => ({
          ...prev,
          lastSync: new Date(),
          pendingChanges: false,
        }));

        console.log(`[${config.key}] Data synced to API successfully`);
        return result;
      } catch (error) {
        console.error(`[${config.key}] Error syncing to API:`, error);
        throw error;
      }
    },
    [status.isLoggedIn, config.key]
  );

  const save = useCallback(
    async (data: T, apiCall?: () => Promise<unknown>): Promise<void> => {
      await saveLocal(data);

      if (status.isLoggedIn && apiCall) {
        try {
          await syncToAPI(apiCall);
        } catch (error) {
          console.warn(
            `[${config.key}] API sync failed, but data saved locally:`,
            error
          );
        }
      }
    },
    [saveLocal, syncToAPI, status.isLoggedIn]
  );

  return {
    ...status,
    save,
    loadLocal,
    clearLocal,
    syncToAPI,
    saveLocal,
  };
};
