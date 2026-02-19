import { getEndpoint } from "@/endpoints";
import httpClient from "@/utils/httpClient";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";
import { useConditionalStorage } from "./useConditionalStorage";

interface PomodoroSession {
  id: string;
  sessionType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK";
  durationInSeconds: number;
  completedAt: string;
  relatedTaskId?: string;
  taskTitle?: string;
}

interface PomodoroSettings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  alarmSound?: string;
  alarmVolume: number;
  tickingSound?: string;
  tickingVolume: number;
}

export const usePomodoroStorage = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<PomodoroSettings>({
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    alarmVolume: 0.5,
    tickingVolume: 0.5,
  });
  const [isLoading, setIsLoading] = useState(false);

  const sessionsStorage = useConditionalStorage<PomodoroSession[]>({
    key: "pomodoro-sessions",
    defaultData: [],
  });

  const settingsStorage = useConditionalStorage<PomodoroSettings>({
    key: "pomodoro-settings",
    defaultData: {
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4,
      alarmVolume: 0.5,
      tickingVolume: 0.5,
    },
  });

  const logSessionApi = useApi((...args: unknown[]) => {
    const data = args[0] as {
      sessionType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK";
      durationInSeconds: number;
      relatedTaskId?: string;
      taskTitle?: string;
    };
    return httpClient.post(getEndpoint("logPomodoroSession").route, data);
  });

  const getSettingsApi = useApi(() =>
    httpClient.get(getEndpoint("pomodoroSettings").route)
  );
  const updateSettingsApi = useApi((...args: unknown[]) => {
    const data = args[0] as Record<string, unknown>;
    return httpClient.put(getEndpoint("updatePomodoroSettings").route, data);
  });
  const getHistoryApi = useApi((params?: { page?: number; limit?: number }) =>
    httpClient.get(getEndpoint("pomodoroHistory").route, { params })
  );
  const getStatsApi = useApi(() =>
    httpClient.get(getEndpoint("pomodoroStats").route)
  );

  // Load data from server when logged in
  const loadServerData = useCallback(async () => {
    if (!sessionsStorage.isLoggedIn) {
      // Load from local storage when not logged in
      const localSessions = await sessionsStorage.loadLocal();
      const localSettings = await settingsStorage.loadLocal();

      setSessions(localSessions || []);
      setSettings(
        localSettings || {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          longBreakInterval: 4,
          alarmVolume: 0.5,
          tickingVolume: 0.5,
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Load settings from server
      const settingsResponse = await getSettingsApi.makeRequest();
      const serverSettings = settingsResponse.data as PomodoroSettings;
      setSettings(serverSettings);
      await settingsStorage.saveLocal(serverSettings);

      // Load history from server
      const historyResponse = await getHistoryApi.makeRequest({
        page: 1,
        limit: 100,
      });
      const serverSessions = (
        ((historyResponse.data as Record<string, unknown>)?.data as Record<
          string,
          unknown
        >[]) || []
      ).map((session: Record<string, unknown>) => ({
        id: (session.externalId as string) || `server-${session.id}`,
        sessionType: session.sessionType as
          | "POMODORO"
          | "SHORT_BREAK"
          | "LONG_BREAK",
        durationInSeconds: session.durationInSeconds as number,
        completedAt: session.completedAt as string,
        relatedTaskId: session.relatedTaskId as string | undefined,
        taskTitle: session.taskTitle as string | undefined,
      }));
      setSessions(serverSessions);
      await sessionsStorage.saveLocal(serverSessions);

      console.log("[Pomodoro] Data loaded from server successfully");
    } catch (error) {
      console.error("[Pomodoro] Error loading data from server:", error);

      // Fallback to local data
      const localSessions = await sessionsStorage.loadLocal();
      const localSettings = await settingsStorage.loadLocal();

      setSessions(localSessions || []);
      setSettings(
        localSettings || {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          longBreakInterval: 4,
          alarmVolume: 0.5,
          tickingVolume: 0.5,
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionsStorage, settingsStorage, getSettingsApi, getHistoryApi]);

  // Load data on mount and when login status changes
  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  const addSession = useCallback(
    async (sessionData: Omit<PomodoroSession, "id" | "completedAt">) => {
      const newSession: PomodoroSession = {
        ...sessionData,
        id: `local-${Date.now()}`,
        completedAt: new Date().toISOString(),
      };

      // Update local state immediately
      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);

      // Save to local storage
      await sessionsStorage.saveLocal(updatedSessions);

      // Sync to server if logged in
      if (sessionsStorage.isLoggedIn) {
        try {
          await logSessionApi.makeRequest({
            sessionType: sessionData.sessionType,
            durationInSeconds: sessionData.durationInSeconds,
            relatedTaskId: sessionData.relatedTaskId,
            taskTitle: sessionData.taskTitle,
          });
          console.log("[Pomodoro] Session synced to server");
        } catch (error) {
          console.error("[Pomodoro] Error syncing session to server:", error);
        }
      }

      return newSession;
    },
    [sessions, sessionsStorage, logSessionApi]
  );

  const getSessions = useCallback(async (): Promise<PomodoroSession[]> => {
    return sessions;
  }, [sessions]);

  const getSettings = useCallback(async (): Promise<PomodoroSettings> => {
    return settings;
  }, [settings]);

  const updateSettings = useCallback(
    async (newSettings: Partial<PomodoroSettings>): Promise<void> => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Save to local storage
      await settingsStorage.saveLocal(updatedSettings);

      // Sync to server if logged in
      if (sessionsStorage.isLoggedIn) {
        try {
          await updateSettingsApi.makeRequest(updatedSettings);
          console.log("[Pomodoro] Settings synced to server");
        } catch (error) {
          console.error("[Pomodoro] Error syncing settings to server:", error);
        }
      }
    },
    [settings, settingsStorage, sessionsStorage, updateSettingsApi]
  );

  const getStats = useCallback(async () => {
    const sessions = await getSessions();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todaySessions = sessions.filter(
      (session) => new Date(session.completedAt) >= today
    );

    const pomodoroSessions = sessions.filter(
      (session) => session.sessionType === "POMODORO"
    );

    const totalFocusTime = pomodoroSessions.reduce(
      (total, session) => total + session.durationInSeconds,
      0
    );

    return {
      today: {
        sessions: todaySessions.length,
        pomodoros: todaySessions.filter((s) => s.sessionType === "POMODORO")
          .length,
      },
      total: {
        sessions: sessions.length,
        pomodoros: pomodoroSessions.length,
        focusTime: Math.round(totalFocusTime / 60),
      },
    };
  }, [getSessions]);

  const clearAllData = useCallback(async (): Promise<void> => {
    await sessionsStorage.clearLocal();
    await settingsStorage.clearLocal();
  }, [sessionsStorage, settingsStorage]);

  return {
    // Data
    sessions,
    settings,

    // Status
    isLoggedIn: sessionsStorage.isLoggedIn,
    hasLocalData: sessionsStorage.hasLocalData,
    pendingChanges: sessionsStorage.pendingChanges,
    lastSync: sessionsStorage.lastSync,
    isLoading,

    // Actions
    addSession,
    getSessions,
    getSettings,
    updateSettings,
    getStats,
    clearAllData,
    loadServerData,

    // Loading states
    loading:
      isLoading ||
      logSessionApi.loading ||
      getSettingsApi.loading ||
      updateSettingsApi.loading ||
      getHistoryApi.loading ||
      getStatsApi.loading,
  };
};
