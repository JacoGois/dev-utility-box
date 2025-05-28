import { Progress } from "@/components/ui/Progress";
import React from "react";
import { CIRCUMFERENCE, MODES, TIMER_SVG_RADIUS } from "../shared";

interface TimerDisplayProps {
  secondsLeft: number;
  modeConfig: (typeof MODES)[keyof typeof MODES];
}

const TimerDisplay = React.memo(
  ({ secondsLeft, modeConfig }: TimerDisplayProps) => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");

    const progressValue = Math.max(
      0,
      Math.min(
        100,
        ((modeConfig.duration - secondsLeft) / modeConfig.duration) * 100
      )
    );

    const strokeDashoffset =
      CIRCUMFERENCE - (progressValue / 100) * CIRCUMFERENCE;
    const CurrentModeIcon = modeConfig.icon;

    return (
      <div className="flex flex-col items-center space-y-3 @sm:space-y-4 @lg:space-y-6">
        <div className="relative flex-shrink-0">
          <svg
            className="w-32 h-32 @sm:w-48 @sm:h-48 @lg:w-64 @lg:h-64 -rotate-90"
            viewBox="0 0 256 256"
          >
            <circle
              cx="128"
              cy="128"
              r={TIMER_SVG_RADIUS}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="128"
              cy="128"
              r={TIMER_SVG_RADIUS}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              strokeLinecap="round"
              style={{ color: modeConfig.color }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CurrentModeIcon className="w-4 h-4 @sm:w-6 @sm:h-6 @lg:w-8 @lg:h-8 mb-1 @sm:mb-2 text-muted-foreground" />
            <div className="text-2xl @sm:text-3xl @lg:text-5xl font-mono font-bold text-foreground">
              {minutes}:{seconds}
            </div>
            <div className="text-xs @sm:text-sm text-muted-foreground mt-1">
              {modeConfig.label}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs @sm:max-w-sm @lg:max-w-md">
          <Progress value={progressValue} className="h-1.5 @sm:h-2" />
        </div>
      </div>
    );
  }
);

TimerDisplay.displayName = "TimerDisplay";
export { TimerDisplay };
