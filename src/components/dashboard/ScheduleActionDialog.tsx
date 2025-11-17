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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RemediationAction } from '@/types/diagnostics';
import { Schedule, ScheduleCondition, RecurrencePattern, ConditionType } from '@/types/scheduling';
import { Calendar as CalendarIcon, Clock, Repeat, AlertCircle, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleActionDialogProps {
  action: RemediationAction | null;
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
  onSchedule: (actionId: string, schedule: Schedule) => void;
}

export function ScheduleActionDialog({
  action,
  projectId,
  projectName,
  open,
  onClose,
  onSchedule,
}: ScheduleActionDialogProps) {
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring'>('once');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [endDate, setEndDate] = useState<Date>();
  const [conditions, setConditions] = useState<ScheduleCondition[]>([]);
  const [useConditions, setUseConditions] = useState(false);

  if (!action) return null;

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { type: 'threshold', metric: 'cpu_usage', operator: 'gt', value: 80 },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (index: number, updates: Partial<ScheduleCondition>) => {
    setConditions(
      conditions.map((cond, i) => (i === index ? { ...cond, ...updates } : cond))
    );
  };

  const handleSchedule = () => {
    const schedule: Schedule = {
      type: scheduleType,
    };

    if (scheduleType === 'once') {
      if (!selectedDate) return;
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      schedule.scheduledTime = scheduledDateTime.toISOString();
    } else {
      if (!selectedDate) return;
      const [hours, minutes] = selectedTime.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes));
      schedule.scheduledTime = startDateTime.toISOString();
      schedule.recurrence = {
        pattern: recurrencePattern,
        interval: parseInt(recurrenceInterval),
        endDate: endDate?.toISOString(),
      };
    }

    if (useConditions && conditions.length > 0) {
      schedule.conditions = conditions;
    }

    onSchedule(action.id, schedule);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Remediation Action
          </DialogTitle>
          <DialogDescription>
            {action.title} • {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2 max-h-[calc(85vh-200px)]">
          {/* Schedule Type */}
          <div className="space-y-2">
            <Label>Schedule Type</Label>
            <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as 'once' | 'recurring')}>
              <TabsList className="grid w-full grid-cols-2 bg-control-surface">
                <TabsTrigger value="once">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  One-Time
                </TabsTrigger>
                <TabsTrigger value="recurring">
                  <Repeat className="w-4 h-4 mr-2" />
                  Recurring
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Date and Time Selection */}
          <Card className="p-4 bg-control-surface border-control-border space-y-4">
            <div className="space-y-2">
              <Label>
                {scheduleType === 'once' ? 'Execution Date' : 'Start Date'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Execution Time</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-background"
              />
            </div>
          </Card>

          {/* Recurring Options */}
          {scheduleType === 'recurring' && (
            <Card className="p-4 bg-control-surface border-control-border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pattern</Label>
                  <Select value={recurrencePattern} onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-sm text-muted-foreground">
                      {recurrencePattern === 'hourly' ? 'hour(s)' : 
                       recurrencePattern === 'daily' ? 'day(s)' :
                       recurrencePattern === 'weekly' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>No end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => !selectedDate || date <= selectedDate}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </Card>
          )}

          {/* Conditional Execution */}
          <Card className="p-4 bg-control-surface border-control-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Conditional Execution</Label>
                <p className="text-xs text-muted-foreground">
                  Execute only when specific conditions are met
                </p>
              </div>
              <Switch checked={useConditions} onCheckedChange={setUseConditions} />
            </div>

            {useConditions && (
              <div className="space-y-3 pt-2">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-background rounded border border-control-border">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Select
                        value={condition.type}
                        onValueChange={(v) => handleUpdateCondition(index, { type: v as ConditionType })}
                      >
                        <SelectTrigger className="bg-control-surface">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="threshold">Threshold</SelectItem>
                          <SelectItem value="anomaly_detected">Anomaly Detected</SelectItem>
                          <SelectItem value="health_score">Health Score</SelectItem>
                          <SelectItem value="success_rate">Success Rate</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(v) => handleUpdateCondition(index, { operator: v as any })}
                      >
                        <SelectTrigger className="bg-control-surface">
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

                      <Input
                        type="number"
                        value={condition.value}
                        onChange={(e) => handleUpdateCondition(index, { value: parseFloat(e.target.value) })}
                        className="bg-control-surface"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(index)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            )}
          </Card>

          {/* Action Preview */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-foreground">
                <p className="font-semibold mb-1">Scheduled Action</p>
                <p>{action.description}</p>
                <p className="mt-2 text-muted-foreground">
                  Estimated execution time: {action.estimated_time}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!selectedDate}>
            <Clock className="w-4 h-4 mr-2" />
            Schedule Action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
