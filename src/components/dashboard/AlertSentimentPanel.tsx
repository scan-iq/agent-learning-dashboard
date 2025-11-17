import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import { SentimentAnalysis } from "@/types/alert-sentiment";

interface AlertSentimentPanelProps {
  analysis: SentimentAnalysis;
  onApplyRecommendation: (ruleId: string) => void;
  onClearData: () => void;
}

export function AlertSentimentPanel({
  analysis,
  onApplyRecommendation,
  onClearData,
}: AlertSentimentPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Alert Sentiment Analysis</h3>
        </div>
        {analysis.totalFeedback > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearData}
          >
            Clear Learning Data
          </Button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Feedback</p>
          </div>
          <p className="text-2xl font-bold">{analysis.totalFeedback}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-muted-foreground">Acknowledgment Rate</p>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {analysis.totalFeedback > 0 
              ? `${Math.round(analysis.acknowledgmentRate * 100)}%`
              : '0%'
            }
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-orange-500" />
            <p className="text-sm text-muted-foreground">Dismissal Rate</p>
          </div>
          <p className="text-2xl font-bold text-orange-500">
            {analysis.totalFeedback > 0 
              ? `${Math.round(analysis.dismissalRate * 100)}%`
              : '0%'
            }
          </p>
        </Card>
      </div>

      {/* Learning Progress */}
      {analysis.learningProgress.length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Learning Progress by Metric
          </h4>
          <div className="space-y-4">
            {analysis.learningProgress.map((progress) => (
              <div key={progress.metric} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">
                    {progress.metric.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {progress.feedbackCount} samples
                    </span>
                    <Badge
                      variant="outline"
                      className={getConfidenceColor(progress.confidence)}
                    >
                      {getConfidenceLabel(progress.confidence)} Confidence
                    </Badge>
                  </div>
                </div>
                <Progress value={progress.confidence * 100} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 ? (
        <Card className="p-6">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Threshold Recommendations ({analysis.recommendations.length})
          </h4>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {analysis.recommendations.map((rec) => (
                <Card key={rec.ruleId} className="p-4 border-l-4 border-l-yellow-500">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold">{rec.ruleName}</h5>
                        <p className="text-sm text-muted-foreground capitalize">
                          {rec.metric.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getConfidenceColor(rec.confidence)}
                      >
                        {Math.round(rec.confidence * 100)}% confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Threshold</p>
                        <p className="font-semibold">{rec.currentThreshold}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Recommended</p>
                        <p className="font-semibold text-primary">
                          {rec.recommendedThreshold}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm">{rec.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {rec.sampleSize} alert samples
                      </p>
                    </div>

                    <Button
                      onClick={() => onApplyRecommendation(rec.ruleId)}
                      className="w-full"
                      size="sm"
                    >
                      Apply Recommendation
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">Building Intelligence</h4>
          <p className="text-sm text-muted-foreground mb-1">
            {analysis.totalFeedback === 0
              ? "No feedback data yet. Acknowledge or dismiss alerts to start learning."
              : `Collecting more data... Need at least 5 samples per rule to generate recommendations.`
            }
          </p>
          {analysis.totalFeedback > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Current feedback: {analysis.totalFeedback} samples
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
