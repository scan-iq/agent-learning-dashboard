import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertRule, NotificationChannel, AlertChannel, MetricType, AlertSeverity } from '@/types/alerts';
import {
  Bell,
  Plus,
  Trash2,
  Mail,
  MessageSquare,
  Webhook,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface AlertManagementDialogProps {
  rules: AlertRule[];
  channels: NotificationChannel[];
  open: boolean;
  onClose: () => void;
  onAddRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  onUpdateRule: (id: string, rule: Partial<AlertRule>) => void;
  onDeleteRule: (id: string) => void;
  onUpdateChannel: (channel: NotificationChannel) => void;
}

export function AlertManagementDialog({
  rules,
  channels,
  open,
  onClose,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onUpdateChannel,
}: AlertManagementDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    description: '',
    enabled: true,
    metric: 'cpu_usage',
    condition: 'gte',
    threshold: 80,
    severity: 'warning',
    duration: 60,
    channels: ['in_app'],
    cooldown: 5,
  });

  const metricLabels: Record<MetricType, string> = {
    cpu_usage: 'CPU Usage (%)',
    memory_usage: 'Memory Usage (%)',
    response_time: 'Response Time (ms)',
    error_rate: 'Error Rate (%)',
    queue_depth: 'Queue Depth',
    active_connections: 'Active Connections',
  };

  const handleCreateRule = () => {
    if (!newRule.name || newRule.threshold === undefined) return;

    onAddRule(newRule as Omit<AlertRule, 'id' | 'createdAt'>);
    setIsCreating(false);
    setNewRule({
      name: '',
      description: '',
      enabled: true,
      metric: 'cpu_usage',
      condition: 'gte',
      threshold: 80,
      severity: 'warning',
      duration: 60,
      channels: ['in_app'],
      cooldown: 5,
    });
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    const config = {
      info: { label: 'INFO', class: 'bg-primary/10 text-primary border-primary' },
      warning: { label: 'WARNING', class: 'bg-warning/10 text-warning border-warning' },
      critical: { label: 'CRITICAL', class: 'bg-destructive/10 text-destructive border-destructive' },
    }[severity];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getChannelIcon = (channel: AlertChannel) => {
    const icons: Record<AlertChannel, any> = {
      email: Mail,
      slack: MessageSquare,
      webhook: Webhook,
      in_app: Bell,
    };
    return icons[channel];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            Alert Management
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              {rules.length} Rules
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Configure alert rules and notification channels for proactive monitoring
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="bg-control-surface">
            <TabsTrigger value="rules">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alert Rules
            </TabsTrigger>
            <TabsTrigger value="channels">
              <Settings className="w-4 h-4 mr-2" />
              Notification Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {rules.filter(r => r.enabled).length} of {rules.length} rules enabled
              </p>
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </div>

            <ScrollArea className="h-[calc(90vh-300px)]">
              <div className="space-y-3 pr-4">
                {isCreating && (
                  <Card className="p-4 bg-primary/5 border-primary">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Create New Alert Rule</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rule Name</Label>
                          <Input
                            value={newRule.name}
                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                            placeholder="High CPU Usage Alert"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select
                            value={newRule.severity}
                            onValueChange={(v) => setNewRule({ ...newRule, severity: v as AlertSeverity })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newRule.description}
                          onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                          placeholder="Alert when CPU usage exceeds threshold..."
                          className="bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Metric</Label>
                          <Select
                            value={newRule.metric}
                            onValueChange={(v) => setNewRule({ ...newRule, metric: v as MetricType })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(metricLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Condition</Label>
                          <Select
                            value={newRule.condition}
                            onValueChange={(v) => setNewRule({ ...newRule, condition: v as any })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gt">Greater than</SelectItem>
                              <SelectItem value="gte">Greater or equal</SelectItem>
                              <SelectItem value="lt">Less than</SelectItem>
                              <SelectItem value="lte">Less or equal</SelectItem>
                              <SelectItem value="eq">Equal to</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Threshold</Label>
                          <Input
                            type="number"
                            value={newRule.threshold}
                            onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (seconds)</Label>
                          <Input
                            type="number"
                            value={newRule.duration}
                            onChange={(e) => setNewRule({ ...newRule, duration: parseInt(e.target.value) })}
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            How long condition must persist before alerting
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Cooldown (minutes)</Label>
                          <Input
                            type="number"
                            value={newRule.cooldown}
                            onChange={(e) => setNewRule({ ...newRule, cooldown: parseInt(e.target.value) })}
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum time between alerts
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notification Channels</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['in_app', 'email', 'slack', 'webhook'] as AlertChannel[]).map((channel) => {
                            const Icon = getChannelIcon(channel);
                            const isSelected = newRule.channels?.includes(channel);
                            const channelConfig = channels.find(c => c.type === channel);
                            const isConfigured = channelConfig?.enabled;

                            return (
                              <Button
                                key={channel}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  const current = newRule.channels || [];
                                  setNewRule({
                                    ...newRule,
                                    channels: isSelected
                                      ? current.filter(c => c !== channel)
                                      : [...current, channel],
                                  });
                                }}
                                disabled={channel !== 'in_app' && !isConfigured}
                                className="flex flex-col h-auto py-2"
                              >
                                <Icon className="w-4 h-4 mb-1" />
                                <span className="text-xs capitalize">{channel.replace('_', ' ')}</span>
                                {channel !== 'in_app' && !isConfigured && (
                                  <span className="text-[10px] text-muted-foreground">(not configured)</span>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsCreating(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRule}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Rule
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {rules.length === 0 && !isCreating ? (
                  <Card className="p-8 bg-control-surface border-control-border text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-foreground font-medium mb-1">No Alert Rules</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first alert rule to start monitoring
                    </p>
                    <Button onClick={() => setIsCreating(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  </Card>
                ) : (
                  rules.map((rule) => (
                    <Card
                      key={rule.id}
                      className={`p-4 border transition-all ${
                        rule.enabled
                          ? 'bg-control-surface border-control-border'
                          : 'bg-muted/30 border-muted opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground">{rule.name}</h4>
                            {getSeverityBadge(rule.severity)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => onUpdateRule(rule.id, { enabled: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteRule(rule.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-xs mb-3">
                        <div>
                          <p className="text-muted-foreground mb-1">Condition</p>
                          <p className="font-mono text-foreground">
                            {metricLabels[rule.metric]} {rule.condition} {rule.threshold}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Duration</p>
                          <p className="font-mono text-foreground">{rule.duration}s</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Cooldown</p>
                          <p className="font-mono text-foreground">{rule.cooldown}m</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Last Triggered</p>
                          <p className="font-mono text-foreground">
                            {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rule.channels.map((channel) => {
                          const Icon = getChannelIcon(channel);
                          return (
                            <Badge key={channel} variant="outline" className="bg-primary/10 text-primary border-primary">
                              <Icon className="w-3 h-3 mr-1" />
                              {channel.replace('_', ' ')}
                            </Badge>
                          );
                        })}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="channels" className="mt-4">
            <ScrollArea className="h-[calc(90vh-250px)]">
              <div className="space-y-4 pr-4">
                {channels.map((channel) => {
                  const Icon = getChannelIcon(channel.type);
                  return (
                    <Card key={channel.type} className="p-4 bg-control-surface border-control-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground capitalize">
                              {channel.type.replace('_', ' ')} Notifications
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {channel.enabled ? 'Configured and active' : 'Not configured'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={(checked) =>
                            onUpdateChannel({ ...channel, enabled: checked })
                          }
                        />
                      </div>

                      {channel.type === 'email' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Email Recipients</Label>
                            <Textarea
                              value={channel.config.recipients?.join(', ') || ''}
                              onChange={(e) =>
                                onUpdateChannel({
                                  ...channel,
                                  config: {
                                    ...channel.config,
                                    recipients: e.target.value.split(',').map(s => s.trim()),
                                  },
                                })
                              }
                              placeholder="email1@example.com, email2@example.com"
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Comma-separated list of email addresses
                            </p>
                          </div>
                          <Card className="p-3 bg-warning/5 border-warning/20">
                            <p className="text-xs text-warning">
                              ⚡ Requires Lovable Cloud with Resend integration
                            </p>
                          </Card>
                        </div>
                      )}

                      {channel.type === 'slack' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Slack Webhook URL</Label>
                            <Input
                              type="password"
                              value={channel.config.webhookUrl || ''}
                              onChange={(e) =>
                                onUpdateChannel({
                                  ...channel,
                                  config: { ...channel.config, webhookUrl: e.target.value },
                                })
                              }
                              placeholder="https://hooks.slack.com/services/..."
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Channel</Label>
                            <Input
                              value={channel.config.channel || ''}
                              onChange={(e) =>
                                onUpdateChannel({
                                  ...channel,
                                  config: { ...channel.config, channel: e.target.value },
                                })
                              }
                              placeholder="#alerts"
                              className="bg-background"
                            />
                          </div>
                          <Card className="p-3 bg-warning/5 border-warning/20">
                            <p className="text-xs text-warning">
                              ⚡ Requires Lovable Cloud to store webhook URL securely
                            </p>
                          </Card>
                        </div>
                      )}

                      {channel.type === 'webhook' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                              value={channel.config.url || ''}
                              onChange={(e) =>
                                onUpdateChannel({
                                  ...channel,
                                  config: { ...channel.config, url: e.target.value },
                                })
                              }
                              placeholder="https://your-api.com/alerts"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Method</Label>
                            <Select
                              value={channel.config.method || 'POST'}
                              onValueChange={(v) =>
                                onUpdateChannel({
                                  ...channel,
                                  config: { ...channel.config, method: v as 'POST' | 'PUT' },
                                })
                              }
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Card className="p-3 bg-warning/5 border-warning/20">
                            <p className="text-xs text-warning">
                              ⚡ Requires Lovable Cloud for secure webhook delivery
                            </p>
                          </Card>
                        </div>
                      )}

                      {channel.type === 'in_app' && (
                        <Card className="p-3 bg-success/5 border-success/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <p className="text-xs text-success">
                              In-app notifications are always available and don't require additional configuration
                            </p>
                          </div>
                        </Card>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
