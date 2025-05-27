"use client";

import { useEffect, useState } from "react";

export function PomodoroApp() {
  const [seconds, setSeconds] = useState(1500);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="text-center text-black text-lg font-mono h-full w-full">
      {minutes}:{secs}
    </div>
  );
}
