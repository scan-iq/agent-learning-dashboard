# reflexion-stats

View comprehensive reflexion system statistics and learning metrics.

## Usage

```bash
/reflexion-stats [--period <timeframe>] [--breakdown <type>] [--export]
```

## Options

- `--period` - Time period: daily, weekly, monthly, all (default: monthly)
- `--breakdown` - Group by: project, verdict, pattern, domain
- `--export` - Export format: json, csv, markdown
- `--compare` - Compare against previous period

## Examples

### Monthly statistics
```bash
/reflexion-stats
```

### Weekly breakdown by project
```bash
/reflexion-stats --period weekly --breakdown project
```

### Verdict analysis with comparison
```bash
/reflexion-stats --period monthly --breakdown verdict --compare
```

## What This Does

Provides comprehensive statistics on:
- Total reflexions captured
- Success/failure rates
- Pattern discovery metrics
- Learning velocity
- Most common patterns
- Trajectory complexity analysis
- Time investment tracking
- Knowledge reuse rates

## When to Use

- **Performance Reviews**: Track learning progress
- **Project Planning**: Estimate task complexity
- **Pattern Analysis**: Identify most valuable patterns
- **System Health**: Monitor reflexion system effectiveness

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion System Statistics                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Period: Last 30 Days                                         ║
║ Generated: 2025-11-17 16:45:00                              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ OVERVIEW                                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Total Reflexions:      247                                   ║
║ Avg per Day:           8.2                                   ║
║ Unique Projects:       8                                     ║
║ Patterns Discovered:   34                                    ║
║ Total Trajectory Steps: 1,892                                ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ VERDICT BREAKDOWN                                            ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Passed:   215 (87.0%)  ████████████████████░░░░          ║
║ ❌ Failed:    21 (8.5%)   ██░░░░░░░░░░░░░░░░░░░░░░          ║
║ ⚠️  Partial:  11 (4.5%)   █░░░░░░░░░░░░░░░░░░░░░░░          ║
╠══════════════════════════════════════════════════════════════╣
║ Trend: +3.2% success rate vs previous period ↗️              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ TOP PERFORMING PROJECTS                                      ║
╠══════════════════════════════════════════════════════════════╣
║ 1. iris-prime-console     94.3% success (87 reflexions)     ║
║ 2. agent-learning-core    91.2% success (68 reflexions)     ║
║ 3. claude-flow           89.7% success (42 reflexions)     ║
║ 4. flow-nexus            86.1% success (28 reflexions)     ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ MOST COMMON PATTERNS (Discovered in reflexions)              ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Concurrent operations       89 occurrences (36.0%)       ║
║ 2. Supabase batching          76 occurrences (30.8%)       ║
║ 3. Error recovery             64 occurrences (25.9%)       ║
║ 4. Vector search optimization  43 occurrences (17.4%)       ║
║ 5. API rate limiting          38 occurrences (15.4%)       ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ COMPLEXITY ANALYSIS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Low Complexity:     98 (39.7%)  - Avg 4.2 steps             ║
║ Medium Complexity:  112 (45.3%) - Avg 7.8 steps             ║
║ High Complexity:    37 (15.0%)  - Avg 14.2 steps            ║
╠══════════════════════════════════════════════════════════════╣
║ Avg Steps per Reflexion: 7.7                                ║
║ Most Complex Task: "Distributed system migration" (28 steps)║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ TIME INVESTMENT                                              ║
╠══════════════════════════════════════════════════════════════╣
║ Total Time Tracked:  487 hours                               ║
║ Avg Time per Reflexion: 1h 58m                              ║
║ Passed Tasks Avg:   1h 45m                                   ║
║ Failed Tasks Avg:   3h 22m (insight: failures take longer)  ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ LEARNING VELOCITY                                            ║
╠══════════════════════════════════════════════════════════════╣
║ Patterns Learned:    34 new patterns this period             ║
║ Knowledge Reuse:     142 cases (57.5% reuse rate)           ║
║ Transfer Success:    89.4% (127/142 successful transfers)   ║
║ Novel Approaches:    23 (9.3% completely new solutions)     ║
╠══════════════════════════════════════════════════════════════╣
║ Trend: Learning velocity +12% vs previous period ⭐          ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ DOMAIN DISTRIBUTION                                          ║
╠══════════════════════════════════════════════════════════════╣
║ Backend/API:       87 (35.2%)                                ║
║ Database:          64 (25.9%)                                ║
║ Frontend:          42 (17.0%)                                ║
║ Integration:       31 (12.6%)                                ║
║ Infrastructure:    23 (9.3%)                                 ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ FAILURE ANALYSIS                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Common Failure Reasons:                                      ║
║ 1. Insufficient error handling     9 cases (42.9%)          ║
║ 2. Complex dependencies            5 cases (23.8%)          ║
║ 3. Performance bottlenecks         4 cases (19.0%)          ║
║ 4. Security vulnerabilities        3 cases (14.3%)          ║
╠══════════════════════════════════════════════════════════════╣
║ Recovery Rate: 76.2% (16/21 failures later resolved)        ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ KEY INSIGHTS                                                 ║
╠══════════════════════════════════════════════════════════════╣
║ ✓ Success rate improving (+3.2% this period)                ║
║ ✓ Pattern reuse at healthy 57.5% (knowledge sharing works)  ║
║ ✓ Learning velocity accelerating (+12%)                     ║
║ ⚠ Failed tasks take 93% longer - consider early validation  ║
║ ⭐ "Concurrent operations" pattern most impactful (36% use) ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/reflexion-track` - Add new reflexions
- `/reflexion-search` - Search reflexion database
- `/reflexion-analyze` - Deep pattern analysis
- `/iris-health` - Overall system health
- `/telemetry-stats` - System telemetry data
