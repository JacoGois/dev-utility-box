import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import React from "react";
import { MODES } from "../shared";

interface ModeSelectorProps {
  currentMode: keyof typeof MODES;
  onModeChange: (modeKey: keyof typeof MODES) => void;

  modesData: typeof MODES;
}

const ModeSelector = React.memo(
  ({ currentMode, onModeChange, modesData }: ModeSelectorProps) => {
    return (
      <Card className="flex-shrink-0">
        <CardContent className="flex flex-wrap gap-2 @sm:gap-3 justify-center p-4 @sm:p-6">
          {Object.entries(modesData).map(([key, val]) => {
            const IconComponent = val.icon;
            const modeKey = key as keyof typeof MODES;
            return (
              <Button
                key={key}
                onClick={() => onModeChange(modeKey)}
                variant={currentMode === key ? "default" : "outline"}
                size="sm"
                className={`text-xs @sm:text-sm transition-all duration-200 ${
                  currentMode === key
                    ? "shadow-md scale-105"
                    : "hover:scale-102"
                }`}
              >
                <IconComponent className="w-3 h-3 @sm:w-4 @sm:h-4 mr-1 @sm:mr-2" />
                <span className="hidden @xs:inline">{val.label}</span>
                <span className="@xs:hidden">{val.label.split(" ")[0]}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    );
  }
);

ModeSelector.displayName = "ModeSelector";
export { ModeSelector };
