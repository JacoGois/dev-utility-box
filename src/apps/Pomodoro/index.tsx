"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { HistoryList } from "./components/HistoryList";
import { ModeSelector } from "./components/ModeSelector";
import { NotificationInfo } from "./components/NotificationInfo";
import { StatsPanel } from "./components/StatsPanel";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import { MODES, Session } from "./shared";

const defaultState = {
  mode: "pomodoro" as keyof typeof MODES,
  secondsLeft: MODES.pomodoro.duration,
  isRunning: false,
  completedPomodoros: 0,
  sessionHistory: [] as Session[],
  notificationDenied: false,
  scrollPosition: 0,
};

type PomodoroProps = {
  instanceId: string;
};

export function Pomodoro({ instanceId }: PomodoroProps) {
  const [state, setState] = usePersistentAppStore(instanceId, defaultState);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSessionEnd = useCallback(() => {
    setState((prevState) => {
      if (typeof window !== "undefined") {
        const audio = new Audio("/pomodoro.mp3");
        audio.play();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Tempo finalizado!", {
            body: `Modo atual: ${MODES[prevState.mode].label}`,
            tag: "pomodoro-session-end",
          });
        }
      }

      const nextPomodoros =
        prevState.mode === "pomodoro"
          ? prevState.completedPomodoros + 1
          : prevState.completedPomodoros;
      const nextMode =
        prevState.mode === "pomodoro"
          ? nextPomodoros % 4 === 0
            ? "longBreak"
            : "shortBreak"
          : "pomodoro";

      return {
        isRunning: false,
        sessionHistory: [
          ...prevState.sessionHistory,
          { mode: prevState.mode, completedAt: new Date().toISOString() },
        ],
        completedPomodoros: nextPomodoros,
        mode: nextMode,
        secondsLeft: MODES[nextMode].duration,
      };
    });
  }, [setState]);

  useEffect(() => {
    if (!state.isRunning) return;

    if (state.secondsLeft <= 0) {
      handleSessionEnd();
      return;
    }

    const interval = setInterval(() => {
      setState((prevState) => ({
        secondsLeft: Math.max(0, prevState.secondsLeft - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.secondsLeft, handleSessionEnd, setState]);

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
  }, []);

  const handleTogglePlayPause = useCallback(() => {
    setState({
      isRunning: !state.isRunning,
    });
  }, [setState]);

  const handleChangeMode = useCallback(
    (newMode: keyof typeof MODES) => {
      setState({
        mode: newMode,
        secondsLeft: MODES[newMode].duration,
        isRunning: false,
      });
    },
    [setState]
  );

  const handleResetTimerCurrentMode = useCallback(() => {
    setState({
      secondsLeft: MODES[state.mode].duration,
      isRunning: false,
    });
  }, [state.mode, setState]);

  const handleScroll = useMemo(
    () =>
      _.debounce(() => {
        if (scrollRef.current) {
          setState({ scrollPosition: scrollRef.current.scrollTop });
        }
      }, 5000),
    [setState]
  );

  const sessionsTodayCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const todayString = new Date().toDateString();
    return state.sessionHistory.filter(
      (session) => new Date(session.completedAt).toDateString() === todayString
    ).length;
  }, [state.sessionHistory]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full w-full bg-background p-2 sm:p-4 overflow-auto @container stable-scrollbar-container"
    >
      <div className="h-full flex flex-col max-w-none space-y-3 @sm:space-y-4 @lg:space-y-6">
        <div className="text-center py-2 @sm:py-4 @lg:py-6 flex-shrink-0">
          <h1 className="text-xl @sm:text-2xl @lg:text-4xl font-bold text-foreground mb-1 @sm:mb-2">
            Timer Pomodoro
          </h1>
          <p className="text-xs @sm:text-sm @lg:text-base text-muted-foreground">
            Técnica de produtividade para foco e concentração
          </p>
        </div>

        <ModeSelector
          currentMode={state.mode}
          onModeChange={handleChangeMode}
          modesData={MODES}
        />

        <div className="flex-1 grid grid-cols-1 @xl:grid-cols-3 gap-3 @sm:gap-4 @lg:gap-6 min-h-0">
          <Card className="@xl:col-span-2 flex flex-col">
            <CardContent className="flex-1 flex flex-col justify-center p-4 @sm:p-6">
              <TimerDisplay
                secondsLeft={state.secondsLeft}
                modeConfig={MODES[state.mode]}
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
              completedPomodoros={state.completedPomodoros}
              sessionsToday={sessionsTodayCount}
            />
            <NotificationInfo notificationDenied={state.notificationDenied} />
            <HistoryList
              sessionHistory={state.sessionHistory}
              modesData={MODES}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
