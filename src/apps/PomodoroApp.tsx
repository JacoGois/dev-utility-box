"use client";

import { useEffect, useState } from "react";

const MODES = {
  pomodoro: { label: "Pomodoro", duration: 0.1 * 60 },
  shortBreak: { label: "Pausa Curta", duration: 0.1 * 60 },
  longBreak: { label: "Pausa Longa", duration: 0.1 * 60 },
};

type Session = {
  mode: keyof typeof MODES;
  completedAt: string;
};

export function PomodoroApp() {
  const [mode, setMode] = useState<keyof typeof MODES>("pomodoro");
  const [secondsLeft, setSecondsLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("completedPomodoros") || "0", 10);
    }
    return 0;
  });
  const [sessionHistory, setSessionHistory] = useState<Session[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("pomodoroHistory");
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  });
  const [notificationDenied, setNotificationDenied] = useState(false);

  useEffect(() => {
    setSecondsLeft(MODES[mode].duration);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("completedPomodoros", completedPomodoros.toString());
      localStorage.setItem("pomodoroHistory", JSON.stringify(sessionHistory));
    }
  }, [completedPomodoros, sessionHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "denied") {
              setNotificationDenied(true);
            }
          });
        } else if (Notification.permission === "denied") {
          setNotificationDenied(true);
        }
      }

      const audio = new Audio("/pomodoro.mp3");
      audio.volume = 0;
      audio.play();
    }
  }, []);

  const handleSessionEnd = () => {
    setIsRunning(false);

    if (typeof window !== "undefined") {
      const audio = new Audio("/pomodoro.mp3");
      audio.play();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Tempo finalizado!", {
          body: `Modo atual: ${MODES[mode].label}`,
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
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("pomodoro");
    }
  };

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full w-full bg-background text-foreground transition-colors p-4">
      <div className="flex gap-2">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setMode(key as keyof typeof MODES)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              mode === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="text-6xl font-bold tabular-nums">
        {minutes}:{seconds}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          {isRunning ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={() => {
            setSecondsLeft(MODES[mode].duration);
            setIsRunning(false);
          }}
          className="bg-muted text-muted-foreground px-4 py-2 rounded"
        >
          Reiniciar
        </button>
      </div>

      <div className="text-sm mt-2 opacity-70">
        Pomodoros completos: {completedPomodoros}
      </div>

      {notificationDenied && (
        <div className="text-xs text-red-500 mt-1">
          Permissão para notificações foi negada. Ative manualmente nas
          configurações do navegador.
        </div>
      )}

      {sessionHistory.length > 0 && (
        <div className="w-full mt-4 max-h-48 overflow-hidden text-sm border-t border-muted pt-2">
          <div className="font-semibold mb-1">Histórico de sessões:</div>
          <ul className="space-y-1 overflow-hidden">
            {sessionHistory
              .slice()
              .reverse()
              .map((session, index) => (
                <li key={index}>
                  {MODES[session.mode].label} -{" "}
                  {new Date(session.completedAt).toLocaleString()}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
