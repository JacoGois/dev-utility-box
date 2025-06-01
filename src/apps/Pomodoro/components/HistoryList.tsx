import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { History } from "lucide-react";
import React from "react";
import { MODES, Session } from "../shared";

interface HistoryListProps {
  sessionHistory: Session[];
  modesData: typeof MODES;
}

const HistoryList = React.memo(
  ({ sessionHistory, modesData }: HistoryListProps) => {
    if (sessionHistory.length === 0) {
      return null;
    }

    return (
      <Card className="flex-1 flex flex-col min-h-44 @md:min-h-0">
        <CardHeader>
          <CardTitle className="flex items-center text-sm @sm:text-base @lg:text-lg">
            <History className="w-4 h-4 @sm:w-5 @sm:h-5 mr-2 text-primary" />
            Histórico Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="space-y-1 @sm:space-y-2 h-full overflow-y-auto">
            {sessionHistory
              .slice()
              .reverse()
              .slice(0, 10)
              .map((session, index) => {
                const SessionIcon = modesData[session.mode].icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 @sm:space-x-3 py-1 @sm:py-2 border-b border-border last:border-0"
                  >
                    <SessionIcon className="w-3 h-3 @sm:w-4 @sm:h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs @sm:text-sm font-medium text-foreground truncate">
                        {modesData[session.mode].label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.completedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    );
  }
);

HistoryList.displayName = "HistoryList";
export { HistoryList };
