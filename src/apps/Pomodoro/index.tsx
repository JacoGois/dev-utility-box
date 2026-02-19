"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { usePomodoroStorage } from "@/hooks/usePomodoroStorage";
import { useAppTranslations } from "@/hooks/useTranslations";
import { useWindowShellStore } from "@/stores/useWindowShellStore";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ConfigModal } from "./components/ConfigModal";
import { HistoryList } from "./components/HistoryList";
import { ModeSelector } from "./components/ModeSelector";
import { NotificationInfo } from "./components/NotificationInfo";
import { StatsPanel } from "./components/StatsPanel";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import { createModes, MODES, Session } from "./shared";

export const defaultState = {
  mode: "pomodoro" as keyof typeof MODES,
  isRunning: false,
  completedPomodoros: 0,
  sessionHistory: [] as Session[],
  notificationDenied: false,
  scrollPosition: 0,
  endTime: 0,
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: "kitchen",
  alarmVolume: [50],
  alarmRepeat: 1,
  tickingSound: "none",
  tickingVolume: [50],
  secondsLeft: 25 * 60,
};

type PomodoroProps = {
  instanceId: string;
};

export function Pomodoro({ instanceId }: PomodoroProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const pomodoroStorage = usePomodoroStorage();
  const t = useAppTranslations("pomodoro");
  const modes = createModes(t);
  const parentModalContainerRef = useWindowShellStore(
    (state) => state.refs[instanceId]
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const durationsInMinutes = useMemo(
    () => ({
      pomodoro: state.pomodoroTime,
      shortBreak: state.shortBreakTime,
      longBreak: state.longBreakTime,
    }),
    [state.pomodoroTime, state.shortBreakTime, state.longBreakTime]
  );

  const handleSessionEnd = useCallback(async () => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/pomodoro.mp3");
      audio.play();
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(t("notifications.timeFinished"), {
          body: `${t("notifications.currentMode")}: ${modes[state.mode].label}`,
          tag: "pomodoro-session-end",
        });
      }
    }

    try {
      await pomodoroStorage.addSession({
        sessionType:
          state.mode === "pomodoro"
            ? "POMODORO"
            : state.mode === "shortBreak"
            ? "SHORT_BREAK"
            : "LONG_BREAK",
        durationInSeconds: durationsInMinutes[state.mode] * 60,
      });
    } catch (error) {
      console.error("Error saving session:", error);
    }

    setState((prevState) => {
      const nextPomodoros =
        prevState.mode === "pomodoro"
          ? prevState.completedPomodoros + 1
          : prevState.completedPomodoros;
      const nextMode =
        prevState.mode === "pomodoro"
          ? nextPomodoros % prevState.longBreakInterval === 0
            ? "longBreak"
            : "shortBreak"
          : "pomodoro";
      const shouldAutoStart =
        (nextMode.includes("Break") && prevState.autoStartBreaks) ||
        (nextMode === "pomodoro" && prevState.autoStartPomodoros);
      const newDuration = (durationsInMinutes[nextMode] || 25) * 60;
      return {
        isRunning: shouldAutoStart,
        sessionHistory: [
          ...prevState.sessionHistory,
          { mode: prevState.mode, completedAt: new Date().toISOString() },
        ],
        completedPomodoros: nextPomodoros,
        mode: nextMode,
        secondsLeft: newDuration,
        endTime: shouldAutoStart ? Date.now() + newDuration * 1000 : 0,
      };
    });
  }, [durationsInMinutes, setState, state.mode]);

  useEffect(() => {
    if (!state.isRunning) return;
    const interval = setInterval(() => {
      const remaining = state.endTime - Date.now();
      const secondsLeft = Math.round(remaining / 1000);
      if (secondsLeft < 0) {
        handleSessionEnd();
      } else {
        setState({ secondsLeft });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state.isRunning, state.endTime, handleSessionEnd, setState]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = state.scrollPosition;
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setState({ notificationDenied: permission === "denied" });
        });
      }
    }
  }, [state.scrollPosition]);

  const handleTogglePlayPause = useCallback(() => {
    setState((prevState) => {
      const newIsRunning = !prevState.isRunning;
      if (newIsRunning) {
        return {
          isRunning: true,
          endTime: Date.now() + prevState.secondsLeft * 1000,
        };
      } else {
        return {
          isRunning: false,
          endTime: 0,
        };
      }
    });
  }, [setState]);

  const handleChangeMode = useCallback(
    (newMode: keyof typeof MODES) => {
      setState({
        mode: newMode,
        secondsLeft: (durationsInMinutes[newMode] || 25) * 60,
        isRunning: false,
        endTime: 0,
      });
    },
    [durationsInMinutes, setState]
  );

  const handleResetTimerCurrentMode = useCallback(() => {
    setState({
      secondsLeft: (durationsInMinutes[state.mode] || 25) * 60,
      isRunning: false,
      endTime: 0,
    });
  }, [state.mode, durationsInMinutes, setState]);

  const handleScroll = useMemo(
    () =>
      _.debounce(() => {
        if (scrollRef.current) {
          setState({ scrollPosition: scrollRef.current.scrollTop });
        }
      }, 2000),
    [setState]
  );

  const sessionsTodayCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const todayString = new Date().toDateString();
    return pomodoroStorage.sessions.filter(
      (session) => new Date(session.completedAt).toDateString() === todayString
    ).length;
  }, [pomodoroStorage.sessions]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full w-full bg-background p-2 sm:p-4 overflow-auto @container stable-scrollbar-container relative"
    >
      <ConfigModal
        instanceId={instanceId}
        parentModalContainerRef={parentModalContainerRef}
      />
      <div className="h-full flex flex-col max-w-none space-y-3 @sm:space-y-4 @lg:space-y-6 mt-8 @sm:mt-0">
        <div className="text-center py-2 @sm:py-4 @lg:py-6 flex-shrink-0">
          <h1 className="text-xl @sm:text-2xl @lg:text-4xl font-bold text-foreground mb-1 @sm:mb-2">
            {t("title")}
          </h1>
          <p className="text-xs @sm:text-sm @lg:text-base text-muted-foreground">
            {t("description")}
          </p>
          <div className="mt-2 flex justify-center">
            {pomodoroStorage.isLoading ? (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Carregando dados...
              </div>
            ) : pomodoroStorage.isLoggedIn ? (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {pomodoroStorage.pendingChanges
                  ? "Sincronizando..."
                  : "Sincronizado"}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Modo Offline - Faça login para sincronizar
              </div>
            )}
          </div>
        </div>

        <ModeSelector
          currentMode={state.mode}
          onModeChange={handleChangeMode}
          modesData={modes}
        />

        <div className="flex-1 grid grid-cols-1 @xl:grid-cols-3 gap-3 @sm:gap-4 @lg:gap-6 min-h-0">
          <Card className="@xl:col-span-2 flex flex-col">
            <CardContent className="flex-1 flex flex-col justify-center p-4 @sm:p-6">
              <TimerDisplay
                secondsLeft={state.secondsLeft}
                modeConfig={modes[state.mode]}
                duration={durationsInMinutes[state.mode] * 60}
              />
              <div className="mt-4 @sm:mt-6 flex justify-center">
                <TimerControls
                  isRunning={state.isRunning}
                  onTogglePlayPause={handleTogglePlayPause}
                  onResetTimer={handleResetTimerCurrentMode}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 @sm:space-y-4 @lg:space-y-6 flex flex-col min-h-0">
            <StatsPanel
              completedPomodoros={
                pomodoroStorage.sessions.filter(
                  (s) => s.sessionType === "POMODORO"
                ).length
              }
              sessionsToday={sessionsTodayCount}
            />
            <NotificationInfo notificationDenied={state.notificationDenied} />
            <HistoryList
              sessionHistory={pomodoroStorage.sessions.map((session) => ({
                mode:
                  session.sessionType === "POMODORO"
                    ? "pomodoro"
                    : session.sessionType === "SHORT_BREAK"
                    ? "shortBreak"
                    : "longBreak",
                completedAt: session.completedAt,
              }))}
              modesData={modes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
