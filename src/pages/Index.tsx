import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { EventsFeed } from '@/components/dashboard/EventsFeed';
import { ProjectDetailsDialog } from '@/components/dashboard/ProjectDetailsDialog';
import { mockOverviewMetrics, mockProjects, mockEvents, mockProjectDetails } from '@/lib/mock-data';
import { Activity, CheckCircle2, AlertTriangle, Brain, Play, RefreshCw } from 'lucide-react';

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = selectedProjectId ? mockProjectDetails[selectedProjectId] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-control-bg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-effect">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IRIS Prime</h1>
                <p className="text-sm text-muted-foreground">AI Operations Control Plane</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Play className="w-4 h-4" />
                Evaluate All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Overview Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Projects"
                value={mockOverviewMetrics.total_projects}
                icon={Activity}
              />
              <MetricCard
                title="Healthy Projects"
                value={mockOverviewMetrics.healthy_projects}
                icon={CheckCircle2}
                trend={{ value: 12, direction: 'up' }}
              />
              <MetricCard
                title="Avg Success Rate"
                value={`${mockOverviewMetrics.avg_success_rate}%`}
                icon={Brain}
                trend={{ value: 3, direction: 'up' }}
              />
              <MetricCard
                title="Active Experts"
                value={mockOverviewMetrics.active_experts}
                icon={Brain}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Grid */}
            <section className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="status-indicator status-healthy" />
                  <span>{mockOverviewMetrics.healthy_projects} Healthy</span>
                  <span className="status-indicator status-warning ml-3" />
                  <span>{mockOverviewMetrics.warning_projects} Warning</span>
                </div>
              </div>
              <div className="grid gap-4">
                {mockProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={setSelectedProjectId}
                  />
                ))}
              </div>
            </section>

            {/* Events Feed */}
            <section>
              <EventsFeed events={mockEvents} />
            </section>
          </div>

          {/* Quick Actions */}
          <section className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Play className="w-5 h-5 text-primary" />
                <span className="text-sm">Evaluate All</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <span className="text-sm">Auto Retrain</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm">Find Patterns</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-sm">Rotation Report</span>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject}
        open={selectedProjectId !== null}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
};

export default Index;
