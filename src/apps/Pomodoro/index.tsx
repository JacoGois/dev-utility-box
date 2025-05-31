"use client";

import { Card, CardContent } from "@/components/ui/Card";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RestoreSessionModal } from "../components/RestoreSessionModal";
import { HistoryList } from "./components/HistoryList";
import { ModeSelector } from "./components/ModeSelector";
import { NotificationInfo } from "./components/NotificationInfo";
import { StatsPanel } from "./components/StatsPanel";
import { TimerControls } from "./components/TimerControls";
import { TimerDisplay } from "./components/TimerDisplay";
import { MODES, Session } from "./shared";

type PomodoroProps = {
  instanceId: string;
};

export function Pomodoro({ instanceId }: PomodoroProps) {
  const storageKeys = useMemo(
    () => ({
      completedPomodoros: `${instanceId}-completedPomodoros`,
      pomodoroHistory: `${instanceId}-pomodoroHistory`,
      secondsLeft: `${instanceId}-secondsLeft`,
      mode: `${instanceId}-mode`,
    }),
    [instanceId]
  );

  const [mode, setMode] = useState<keyof typeof MODES>("pomodoro");
  const [secondsLeft, setSecondsLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restored, setRestored] = useState(false);

  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(
        localStorage.getItem(storageKeys.completedPomodoros) || "0",
        10
      );
    }
    return 0;
  });

  const [sessionHistory, setSessionHistory] = useState<Session[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(storageKeys.pomodoroHistory);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  });
  const [notificationDenied, setNotificationDenied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || restored) return;

    const legacyPrefix = Object.keys(localStorage)
      .find(
        (key) => key.endsWith("-secondsLeft") && !key.startsWith(instanceId)
      )
      ?.split("-secondsLeft")[0];

    if (legacyPrefix) {
      const legacySeconds = localStorage.getItem(`${legacyPrefix}-secondsLeft`);
      const legacyMode = localStorage.getItem(`${legacyPrefix}-mode`);
      const hasSeconds = legacySeconds && !isNaN(Number(legacySeconds));
      const hasValidMode = legacyMode && legacyMode in MODES;

      if (hasSeconds && hasValidMode) {
        setShowRestoreModal(true);
        sessionStorage.setItem("legacyPrefix", legacyPrefix);
      } else {
        setRestored(true);
      }
    } else {
      setRestored(true);
    }
  }, [restored, instanceId, storageKeys]);

  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);

    if (typeof window !== "undefined") {
      const audio = new Audio("/pomodoro.mp3");
      audio.play();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Tempo finalizado!", {
          body: `Modo atual: ${MODES[mode].label}`,
          tag: "pomodoro-session-end",
        });
      }
    }

    setSessionHistory((prev) => [
      ...prev,
      { mode, completedAt: new Date().toISOString() },
    ]);

    if (mode === "pomodoro") {
      const nextPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(nextPomodoros);

      if (nextPomodoros % 4 === 0) {
        setMode("longBreak");
        setSecondsLeft(MODES.longBreak.duration);
      } else {
        setMode("shortBreak");
        setSecondsLeft(MODES.shortBreak.duration);
      }
    } else {
      setMode("pomodoro");
      setSecondsLeft(MODES.pomodoro.duration);
    }
  }, [mode, completedPomodoros]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return MODES[mode].duration;

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionEnd, mode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeys.secondsLeft, String(secondsLeft));
    }
  }, [secondsLeft, storageKeys.secondsLeft]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKeys.mode, mode);
    }
  }, [mode, storageKeys.mode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        storageKeys.completedPomodoros,
        completedPomodoros.toString()
      );
      localStorage.setItem(
        storageKeys.pomodoroHistory,
        JSON.stringify(sessionHistory)
      );
    }
  }, [
    completedPomodoros,
    sessionHistory,
    storageKeys.completedPomodoros,
    storageKeys.pomodoroHistory,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            setNotificationDenied(permission === "denied");
          });
        } else {
          setNotificationDenied(Notification.permission === "denied");
        }
      }

      const audio = new Audio("/pomodoro.mp3");
      audio.volume = 0;
    }
  }, []);

  const handleRestore = useCallback(() => {
    const legacyPrefix = sessionStorage.getItem("legacyPrefix");
    if (!legacyPrefix) return;

    const legacyKeys = {
      secondsLeft: `${legacyPrefix}-secondsLeft`,
      mode: `${legacyPrefix}-mode`,
      completedPomodoros: `${legacyPrefix}-completedPomodoros`,
      pomodoroHistory: `${legacyPrefix}-pomodoroHistory`,
    };

    const legacySecondsStr = localStorage.getItem(legacyKeys.secondsLeft);
    const legacyModeStr = localStorage.getItem(legacyKeys.mode);
    const legacyCompletedStr = localStorage.getItem(
      legacyKeys.completedPomodoros
    );
    const legacyHistoryStr = localStorage.getItem(legacyKeys.pomodoroHistory);

    if (legacySecondsStr) {
      const newSeconds = Number(legacySecondsStr);
      localStorage.setItem(storageKeys.secondsLeft, legacySecondsStr);
      setSecondsLeft(newSeconds);
    }

    if (legacyModeStr && legacyModeStr in MODES) {
      const newMode = legacyModeStr as keyof typeof MODES;
      localStorage.setItem(storageKeys.mode, newMode);
      setMode(newMode);

      if (!legacySecondsStr) {
        setSecondsLeft(MODES[newMode].duration);
      }
    }

    if (legacyCompletedStr) {
      localStorage.setItem(storageKeys.completedPomodoros, legacyCompletedStr);
      setCompletedPomodoros(Number(legacyCompletedStr));
    }

    if (legacyHistoryStr) {
      localStorage.setItem(storageKeys.pomodoroHistory, legacyHistoryStr);
      setSessionHistory(JSON.parse(legacyHistoryStr));
    }

    Object.values(legacyKeys).forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("legacyPrefix");

    setIsRunning(false);
    setRestored(true);
    setShowRestoreModal(false);
  }, [storageKeys]);

  const handleDiscard = useCallback(() => {
    const legacyPrefix = sessionStorage.getItem("legacyPrefix");
    if (legacyPrefix) {
      const legacyKeysToRemove = [
        `${legacyPrefix}-secondsLeft`,
        `${legacyPrefix}-mode`,
        `${legacyPrefix}-completedPomodoros`,
        `${legacyPrefix}-pomodoroHistory`,
      ];
      legacyKeysToRemove.forEach((key) => localStorage.removeItem(key));
      sessionStorage.removeItem("legacyPrefix");
    }

    setRestored(true);
    setShowRestoreModal(false);
  }, []);

  const handleChangeMode = useCallback((newMode: keyof typeof MODES) => {
    setMode(newMode);
    setSecondsLeft(MODES[newMode].duration);
    setIsRunning(false);
  }, []);

  const handleTogglePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);

    if (
      !isRunning &&
      mode === "pomodoro" &&
      secondsLeft === MODES.pomodoro.duration
    ) {
      const audio = new Audio("/pomodoro.mp3");
      audio.volume = 0;
      audio.play().catch(() => {});
    }
  }, [isRunning, mode, secondsLeft]);

  const handleResetTimerCurrentMode = useCallback(() => {
    setSecondsLeft(MODES[mode].duration);
    setIsRunning(false);
  }, [mode]);

  const sessionsTodayCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const todayString = new Date().toDateString();
    return sessionHistory.filter(
      (session) => new Date(session.completedAt).toDateString() === todayString
    ).length;
  }, [sessionHistory]);

  return (
    <div className="h-full w-full bg-background p-2 sm:p-4 overflow-auto @container stable-scrollbar-container">
      <RestoreSessionModal
        open={showRestoreModal}
        onConfirm={handleRestore}
        onCancel={handleDiscard}
      />
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
          currentMode={mode}
          onModeChange={handleChangeMode}
          modesData={MODES}
        />

        <div className="flex-1 grid grid-cols-1 @xl:grid-cols-3 gap-3 @sm:gap-4 @lg:gap-6 min-h-0">
          <Card className="@xl:col-span-2 flex flex-col">
            <CardContent className="flex-1 flex flex-col justify-center p-4 @sm:p-6">
              <TimerDisplay
                secondsLeft={secondsLeft}
                modeConfig={MODES[mode]}
              />
              <div className="mt-4 @sm:mt-6 flex justify-center">
                <TimerControls
                  isRunning={isRunning}
                  onTogglePlayPause={handleTogglePlayPause}
                  onResetTimer={handleResetTimerCurrentMode}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 @sm:space-y-4 @lg:space-y-6 flex flex-col min-h-0">
            <StatsPanel
              completedPomodoros={completedPomodoros}
              sessionsToday={sessionsTodayCount}
            />
            <NotificationInfo notificationDenied={notificationDenied} />
            <HistoryList sessionHistory={sessionHistory} modesData={MODES} />
          </div>
        </div>
      </div>
    </div>
  );
}
