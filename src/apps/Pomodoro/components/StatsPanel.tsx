import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import React from "react";

interface StatsPanelProps {
  completedPomodoros: number;
  sessionsToday: number;
}

const StatsPanel = React.memo(
  ({ completedPomodoros, sessionsToday }: StatsPanelProps) => {
    return (
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center text-sm @sm:text-base @lg:text-lg">
            <CheckCircle2 className="w-4 h-4 @sm:w-5 @sm:h-5 mr-2 text-primary" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 @sm:space-y-3 @lg:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs @sm:text-sm text-muted-foreground">
                Pomodoros completos
              </span>
              <Badge
                variant="secondary"
                className="text-sm @sm:text-base @lg:text-lg px-2 @sm:px-3 py-1"
              >
                {completedPomodoros}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs @sm:text-sm text-muted-foreground">
                Sessões hoje
              </span>
              <Badge
                variant="outline"
                className="px-2 @sm:px-3 py-1 text-xs @sm:text-sm"
              >
                {sessionsToday}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatsPanel.displayName = "StatsPanel";
export { StatsPanel };
