import { Card, CardContent } from "@/components/ui/Card";
import { Bell, BellOff } from "lucide-react";
import React from "react";

interface NotificationInfoProps {
  notificationDenied: boolean;
}

const NotificationInfo = React.memo(
  ({ notificationDenied }: NotificationInfoProps) => {
    return (
      <Card className="flex-shrink-0">
        <CardContent className="p-3 @sm:p-4">
          <div className="flex items-center space-x-2 @sm:space-x-3">
            {notificationDenied ? (
              <>
                <BellOff className="w-4 h-4 @sm:w-5 @sm:h-5 text-destructive flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs @sm:text-sm font-medium text-destructive truncate">
                    Notificações desabilitadas
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Ative nas configurações
                  </p>
                </div>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 @sm:w-5 @sm:h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs @sm:text-sm font-medium text-green-500 truncate">
                    Notificações ativadas
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Você será notificado
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

NotificationInfo.displayName = "NotificationInfo";
export { NotificationInfo };
