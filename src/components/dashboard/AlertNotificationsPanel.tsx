import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertNotification } from '@/types/alerts';
import { Bell, CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface AlertNotificationsPanelProps {
  notifications: AlertNotification[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertNotificationsPanel({
  notifications,
  onAcknowledge,
  onDismiss,
}: AlertNotificationsPanelProps) {
  const unacknowledged = notifications.filter(n => !n.acknowledged);

  const getSeverityConfig = (severity: AlertNotification['severity']) => {
    return {
      info: { icon: Info, class: 'bg-primary/10 border-primary text-primary' },
      warning: { icon: AlertTriangle, class: 'bg-warning/10 border-warning text-warning' },
      critical: { icon: AlertTriangle, class: 'bg-destructive/10 border-destructive text-destructive' },
    }[severity];
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
          {unacknowledged.length > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
              {unacknowledged.length}
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="h-[300px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-success mb-3" />
            <p className="text-foreground font-medium mb-1">All Clear</p>
            <p className="text-sm text-muted-foreground">
              No active alerts at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {notifications.map((notification) => {
              const config = getSeverityConfig(notification.severity);
              const Icon = config.icon;

              return (
                <Card
                  key={notification.id}
                  className={`p-3 border transition-all ${
                    notification.acknowledged
                      ? 'bg-muted/30 opacity-60'
                      : config.class
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      notification.acknowledged ? 'text-muted-foreground' : ''
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {notification.ruleName}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(notification.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.metric.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs font-mono text-foreground">
                            {notification.value.toFixed(1)} / {notification.threshold}
                          </span>
                        </div>
                        {!notification.acknowledged && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAcknowledge(notification.id)}
                              className="h-7 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Acknowledge
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDismiss(notification.id)}
                              className="h-7 w-7"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {notification.acknowledged && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Acknowledged {notification.acknowledgedAt ? format(new Date(notification.acknowledgedAt), 'PPp') : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
