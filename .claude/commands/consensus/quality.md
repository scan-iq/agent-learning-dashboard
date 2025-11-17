# consensus-quality

Analyze consensus decision quality and expert agreement patterns.

## Usage

```bash
/consensus-quality [--period <timeframe>] [--export]
```

## Options

- `--period` - Analysis period: weekly, monthly, all (default: monthly)
- `--export` - Export format: json, csv, markdown
- `--breakdown` - Group by: expert, project, domain

## Examples

### Monthly quality analysis
```bash
/consensus-quality
```

### Expert-specific breakdown
```bash
/consensus-quality --period weekly --breakdown expert
```

## What This Does

Analyzes consensus quality metrics:
- Average consensus scores
- Expert agreement patterns
- Decision outcome tracking
- Quality trends over time

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Consensus Quality Analysis - Last 30 Days                    ║
╠══════════════════════════════════════════════════════════════╣
║ Total Decisions: 89                                          ║
║ Avg Consensus Score: 0.92 (Strong)                          ║
║ Expert Participation: 3.4 avg experts/decision               ║
╠══════════════════════════════════════════════════════════════╣

SCORE DISTRIBUTION
  0.95-1.00: 34 (38.2%) ████████████████████
  0.90-0.95: 28 (31.5%) ████████████████
  0.85-0.90: 18 (20.2%) ██████████
  0.80-0.85:  7 (7.9%)  ████
  Below 0.80: 2 (2.2%)  █

QUALITY TRENDS
  ↗️ Improving: +0.04 vs previous period
  ✅ Low variance: High expert agreement
  ⭐ 96.6% decisions above 0.80 threshold

TOP PERFORMING EXPERT TEAMS
  1. backend + security + api-architect (0.94 avg)
  2. frontend + ux + accessibility (0.93 avg)
  3. database + performance + backend (0.91 avg)
```

## Related Commands

- `/consensus-calculate` - Calculate scores
- `/consensus-rotation` - Optimize expert teams
- `/iris-health` - System health
