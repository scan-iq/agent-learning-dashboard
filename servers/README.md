# IRIS MCP Server Wrappers

Clean TypeScript API wrappers that hide MCP complexity and provide type-safe interfaces.

## Architecture Pattern

Following the [Anthropic MCP Best Practices](https://modelcontextprotocol.io/docs/best-practices/client-design):

- **MCP servers are NOT in Claude's direct context**
- Instead, we create wrapper functions that code can import
- Claude writes code like: `import * as iris from './servers/iris-prime'`
- The wrappers internally call the MCP server
- Results are formatted and returned to Claude as text

## Structure

```
servers/
├── iris-prime/          # IRIS MCP wrappers
│   ├── client.ts        # Internal MCP client
│   ├── evaluateProject.ts
│   ├── detectDrift.ts
│   ├── findPatterns.ts
│   ├── getConsensus.ts
│   ├── queryReflexions.ts
│   ├── getMetrics.ts
│   └── index.ts         # Public API
├── supabase/            # Direct Supabase access
│   ├── query.ts         # CRUD operations
│   ├── subscribe.ts     # Real-time subscriptions
│   └── index.ts
└── README.md
```

## Usage Examples

### Project Evaluation

```typescript
import * as iris from './servers/iris-prime';

// Get comprehensive project report
const report = await iris.evaluateProject({
  projectId: 'nfl-predictor',
  includePatterns: true,
  includeDrift: true,
  includeMetrics: true,
});

console.log(`Health Score: ${report.healthScore}/100`);
console.log(`Status: ${report.status}`);
console.log(`Critical Issues: ${report.summary.criticalIssues}`);

if (report.driftAlerts) {
  report.driftAlerts
    .filter(alert => alert.severity === 'critical')
    .forEach(alert => {
      console.log(`🚨 ${alert.message}`);
    });
}
```

### Drift Detection

```typescript
import * as iris from './servers/iris-prime';

// Detect architectural drift
const drift = await iris.detectDrift({
  projectId: 'nfl-predictor',
  scope: 'architecture',
  threshold: 0.3,
});

if (drift.summary.requiresAction) {
  console.log('⚠️ Drift detected!');
  drift.components.forEach(comp => {
    console.log(`${comp.component}: ${comp.driftScore.toFixed(2)}`);
  });
}

// Create baseline for future comparisons
const baseline = await iris.createBaseline('nfl-predictor');
console.log(`Baseline created: ${baseline.baselineId}`);
```

### Pattern Discovery

```typescript
import * as iris from './servers/iris-prime';

// Find anti-patterns
const antiPatterns = await iris.getAntiPatterns('nfl-predictor');
console.log(`Found ${antiPatterns.length} anti-patterns`);

// Discover new patterns
const discovered = await iris.discoverPatterns('nfl-predictor', 3);
console.log(`Discovered ${discovered.count} new patterns`);

// Match code against patterns
const matches = await iris.matchPatterns(`
  async function fetchData() {
    const response = await fetch('/api/data');
    return response.json();
  }
`, 'typescript');

matches.matches.forEach(match => {
  console.log(`Pattern: ${match.pattern.name} (${match.confidence})`);
});
```

### Consensus Tracking

```typescript
import * as iris from './servers/iris-prime';

// Create decision
const decision = await iris.createConsensusDecision({
  projectId: 'nfl-predictor',
  topic: 'database-migration',
  description: 'Should we migrate to PostgreSQL?',
  requiredVotes: 3,
});

// Submit votes
await iris.submitVote({
  decisionId: decision.id,
  agentId: 'architect-01',
  agentType: 'system-architect',
  vote: 'approve',
  confidence: 0.9,
  reasoning: 'PostgreSQL provides better performance for our use case',
});

// Check if consensus reached
const reached = await iris.hasConsensus(decision.id);
console.log(`Consensus reached: ${reached}`);
```

### Reflexion Queries

```typescript
import * as iris from './servers/iris-prime';

// Get agent learning insights
const insights = await iris.getLearningInsights('nfl-predictor');
console.log(`Learning rate: ${insights.learningRate}`);
console.log(`Trend: ${insights.trend}`);

// Get improvement suggestions
const suggestions = await iris.getImprovementSuggestions('nfl-predictor');
suggestions.forEach(sugg => {
  console.log(`💡 ${sugg.suggestion} (impact: ${sugg.impact})`);
});

// Track successful patterns
const successes = await iris.getSuccessPatterns('nfl-predictor');
console.log(`${successes.length} successful patterns learned`);
```

### Metrics & Telemetry

```typescript
import * as iris from './servers/iris-prime';

// Get comprehensive metrics
const metrics = await iris.getMetrics({
  projectId: 'nfl-predictor',
  metricType: 'all',
  timeframe: '7d',
});

console.log(`Health Score: ${metrics.summary.healthScore}`);

if (metrics.performance) {
  console.log(`Avg Response Time: ${metrics.performance.responseTime.avg}ms`);
  console.log(`Success Rate: ${metrics.performance.reliability.successRate}%`);
}

if (metrics.cost) {
  console.log(`Total Tokens: ${metrics.cost.tokens.total}`);
  console.log(`Estimated Cost: $${metrics.cost.tokens.cost.toFixed(2)}`);
}

// Get system health
const health = await iris.getSystemHealth();
console.log(`System Status: ${health.status} (${health.score})`);
```

### Direct Supabase Access

```typescript
import * as supabase from './servers/supabase';

// Query data
const reflexions = await supabase.query('iris_reflexions', {
  filter: { project_id: 'nfl-predictor' },
  order: { column: 'created_at', ascending: false },
  limit: 10,
});

// Real-time monitoring
const subscription = supabase.onInsert('iris_reflexions', (record) => {
  console.log('New reflexion:', record);
});

// Monitor entire project
const monitor = supabase.monitorProject('nfl-predictor', (event) => {
  console.log(`${event.type} on ${event.table}:`, event.data);
});

// Cleanup
monitor.unsubscribeAll();
```

## Type Safety

All wrappers provide full TypeScript type safety:

```typescript
import type {
  ProjectReport,
  DriftAnalysis,
  Pattern,
  ConsensusDecision,
  Reflexion,
  MetricsReport,
} from './servers/iris-prime';
```

## Environment Variables

Required environment variables:

```bash
# For Supabase direct access
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MCP server auto-detects config from:
# - Environment variables
# - .env file
# - Claude MCP settings
```

## Benefits

1. **Type Safety**: Full TypeScript types for all operations
2. **Clean API**: Simple, intuitive function calls
3. **Error Handling**: Consistent error messages and handling
4. **Documentation**: JSDoc comments for IDE support
5. **Flexibility**: Both MCP and direct Supabase access
6. **Real-time**: Built-in real-time subscription support

## Development

The wrappers are designed to be:

- **Minimal**: Thin layer over MCP with no business logic
- **Focused**: Each file handles one domain
- **Composable**: Functions can be combined for complex workflows
- **Testable**: Easy to mock for unit tests

## Next Steps

1. Add authentication wrappers
2. Implement caching layer
3. Add retry logic for resilience
4. Create batch operation helpers
5. Build CLI tools using these wrappers
