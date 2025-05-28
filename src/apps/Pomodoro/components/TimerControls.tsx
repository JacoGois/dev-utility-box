import { Button } from "@/components/ui/Button";
import { Pause, Play, RotateCcw } from "lucide-react";
import React from "react";

interface TimerControlsProps {
  isRunning: boolean;
  onTogglePlayPause: () => void;
  onResetTimer: () => void;
}

const TimerControls = React.memo(
  ({ isRunning, onTogglePlayPause, onResetTimer }: TimerControlsProps) => {
    return (
      <div className="flex gap-2 @sm:gap-3 @lg:gap-4">
        <Button
          onClick={onTogglePlayPause}
          size="sm"
          className={`px-4 @sm:px-6 @lg:px-8 transition-all duration-200 hover:scale-105 text-xs @sm:text-sm ${
            isRunning
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3 @sm:w-4 @sm:h-4 @lg:w-5 @lg:h-5 mr-1 @sm:mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-3 h-3 @sm:w-4 @sm:h-4 @lg:w-5 @lg:h-5 mr-1 @sm:mr-2" />
              Iniciar
            </>
          )}
        </Button>
        <Button
          onClick={onResetTimer}
          variant="outline"
          size="sm"
          className="px-3 @sm:px-4 @lg:px-6 hover:scale-105 transition-all duration-200 text-xs @sm:text-sm"
        >
          <RotateCcw className="w-3 h-3 @sm:w-4 @sm:h-4 @lg:w-5 @lg:h-5 mr-1 @sm:mr-2" />
          <span className="hidden @sm:inline">Reiniciar</span>
          <span className="@sm:hidden">Reset</span>
        </Button>
      </div>
    );
  }
);

TimerControls.displayName = "TimerControls";
export { TimerControls };
