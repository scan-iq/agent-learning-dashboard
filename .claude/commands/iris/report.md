# iris-report

Generate comprehensive intelligence report with insights, metrics, and recommendations.

## Usage

```bash
/iris-report [--period <timeframe>] [--format <type>] [--sections <list>]
```

## Options

- `--period` - Report timeframe: daily, weekly, monthly, quarterly (default: weekly)
- `--format` - Output format: markdown, html, pdf, json (default: markdown)
- `--sections` - Include specific sections (comma-separated)
- `--executive` - Executive summary format (high-level overview)
- `--technical` - Technical deep-dive format (detailed metrics)

## Examples

### Weekly intelligence report
```bash
/iris-report
```

### Executive monthly summary
```bash
/iris-report --period monthly --executive --format pdf
```

### Technical deep-dive
```bash
/iris-report --period quarterly --technical --format html
```

### Custom sections
```bash
/iris-report --sections performance,patterns,recommendations
```

## What This Does

Generates a comprehensive intelligence report covering:

1. **Executive Summary**: High-level system performance and health
2. **Expert Performance**: Individual and aggregate expert metrics
3. **Learning Metrics**: Knowledge acquisition and pattern discovery
4. **Consensus Analysis**: Decision quality and multi-expert collaboration
5. **Pattern Discovery**: New patterns found and transferred
6. **Reflexion Insights**: Learning from trajectories and failures
7. **Performance Trends**: Historical analysis and projections
8. **Recommendations**: Actionable insights for improvement
9. **Resource Utilization**: Token usage, costs, efficiency
10. **Incident Analysis**: Issues encountered and resolutions

## When to Use

- **Weekly Reviews**: Regular team intelligence briefings
- **Monthly Reports**: Management and stakeholder updates
- **Quarterly Planning**: Strategic intelligence for roadmap
- **Incident Postmortems**: Detailed analysis after issues
- **Performance Reviews**: Evaluate system effectiveness
- **Budget Planning**: Resource utilization and ROI analysis

## Output

See `/iris-health` for sample output structure. The report expands on health checks with:
- Historical trends and analysis
- Comparative metrics across time periods
- Pattern effectiveness scoring
- ROI calculations on retraining
- Predictive analytics on future performance
- Detailed recommendations with priority ranking

Reports are saved to `/reports/` directory and can be exported in multiple formats.

## Related Commands

- `/iris-health` - Current system health snapshot
- `/iris-evaluate-all` - Expert evaluation data
- `/telemetry-stats` - Raw telemetry for reports
- `/consensus-lineage` - Consensus decision history
- `/patterns-discover` - Pattern discovery metrics
