# iris-health

Check overall system health, performance metrics, and intelligence status across all IRIS components.

## Usage

```bash
/iris-health [--detailed] [--components <list>] [--export <format>]
```

## Options

- `--detailed` - Show detailed metrics for each component
- `--components` - Check specific components (comma-separated)
- `--export` - Export health report (json, markdown, html)
- `--alerts-only` - Show only components with issues
- `--history` - Include historical health trends

## Examples

### Quick health check
```bash
/iris-health
```

### Detailed system report
```bash
/iris-health --detailed --history
```

### Check specific components
```bash
/iris-health --components experts,supabase,reflexion
```

### Export health dashboard
```bash
/iris-health --detailed --export html
```

## What This Does

1. **Component Health**: Checks all IRIS subsystems:
   - Expert models and their performance
   - Supabase connectivity and data integrity
   - Reflexion monitoring and learning
   - Consensus tracking and decision quality
   - Pattern discovery and transfers
   - Telemetry collection and analysis
   - Notification systems

2. **Performance Metrics**: Measures system-wide KPIs:
   - Average expert accuracy across projects
   - System response times and latency
   - Resource utilization (memory, CPU, tokens)
   - API health and error rates
   - Data pipeline throughput

3. **Intelligence Metrics**: Evaluates learning effectiveness:
   - Active learning rate
   - Pattern discovery rate
   - Knowledge transfer success
   - Drift detection accuracy
   - Retraining effectiveness

4. **Alerts & Recommendations**: Identifies issues and suggests actions

## When to Use

- **Daily Standup**: Quick system status check
- **Incident Response**: Diagnose system issues
- **Performance Review**: Regular health monitoring
- **Before Deployments**: Validate system readiness
- **After Updates**: Ensure changes didn't break anything
- **Executive Reporting**: System-wide intelligence overview

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS - SYSTEM HEALTH DASHBOARD                        ║
╠══════════════════════════════════════════════════════════════╣
║ Status: HEALTHY ✓                                            ║
║ Last Check: 2025-11-17 15:30:00                             ║
║ Uptime: 47 days, 3 hours                                     ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ COMPONENT STATUS                                             ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Expert Models        HEALTHY     (12/12 operational)      ║
║ ✅ Supabase Backend     HEALTHY     (99.9% uptime)           ║
║ ✅ Reflexion Monitor    HEALTHY     (Active learning)        ║
║ ✅ Consensus Tracker    HEALTHY     (Tracking decisions)     ║
║ ✅ Pattern Discovery    HEALTHY     (67 patterns active)     ║
║ ✅ Telemetry System     HEALTHY     (Collecting metrics)     ║
║ ⚠️  Notifications       WARNING     (1 channel degraded)     ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ KEY PERFORMANCE INDICATORS                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Average Expert Performance:  92.4% ⭐                        ║
║ System Response Time:        187ms ✓                         ║
║ Token Efficiency:            88.7% ⭐                        ║
║ Error Rate:                  0.8%  ✓                         ║
║ API Success Rate:            99.2% ⭐                        ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ INTELLIGENCE METRICS (LAST 7 DAYS)                           ║
╠══════════════════════════════════════════════════════════════╣
║ Reflexions Captured:     1,847                               ║
║ Patterns Discovered:     12 new                              ║
║ Knowledge Transfers:     34 successful                       ║
║ Consensus Decisions:     298                                 ║
║ Auto-Retrains:           3 (100% successful)                 ║
║ Drift Detections:        5 (3 resolved)                      ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ EXPERT MODEL HEALTH                                          ║
╠══════════════════════════════════════════════════════════════╣
║ 🟢 Healthy:    10 experts (83.3%)                            ║
║ 🟡 Warning:     1 expert  (8.3%)  - Minor drift             ║
║ 🔴 Critical:    1 expert  (8.3%)  - Needs attention         ║
║                                                              ║
║ Top Performers:                                              ║
║   1. iris-prime-console    96.2% ⭐⭐⭐                      ║
║   2. agent-learning-core   94.8% ⭐⭐⭐                      ║
║   3. claude-flow          93.1% ⭐⭐                        ║
║                                                              ║
║ Needs Attention:                                             ║
║   ⚠️  legacy-api (82.1%) - Schedule retrain in 5 days       ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ SUPABASE BACKEND                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Connection:         ✅ Connected                             ║
║ Latency:            23ms (excellent)                         ║
║ Storage Used:       847 MB / 500 GB                          ║
║ Active Tables:      12                                       ║
║ Daily Operations:   ~45k reads, ~12k writes                  ║
║ Last Backup:        2 hours ago                              ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ REFLEXION MONITOR                                            ║
╠══════════════════════════════════════════════════════════════╣
║ Status:             ✅ Active                                ║
║ Trajectories/Day:   ~264 captured                            ║
║ Success Rate:       87.3%                                    ║
║ Learning Rate:      +2.4% per week                           ║
║ Storage:            3,492 trajectories total                 ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ ALERTS & WARNINGS                                            ║
╠══════════════════════════════════════════════════════════════╣
║ ⚠️  WARNING: Email notification channel degraded            ║
║     Action: Check SMTP configuration                         ║
║     Impact: Low (WhatsApp and Slack working)                 ║
║                                                              ║
║ 🔔 REMINDER: legacy-api expert due for retrain in 5 days    ║
║     Action: Run /iris-auto-retrain or schedule manually      ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RESOURCE UTILIZATION                                         ║
╠══════════════════════════════════════════════════════════════╣
║ Memory Usage:       2.3 GB / 8 GB (29%)                      ║
║ CPU Usage:          12% average                              ║
║ Disk I/O:           Normal                                   ║
║ Network:            34 MB/day average                        ║
║ Token Usage:        ~142k/day (within budget)                ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ SYSTEM TRENDS (7-DAY)                                        ║
╠══════════════════════════════════════════════════════════════╣
║ Expert Performance:  📈 +1.8%                                ║
║ Response Time:       📉 -12ms                                ║
║ Error Rate:          📉 -0.3%                                ║
║ Learning Rate:       📈 +2.4%                                ║
║ Pattern Discovery:   📈 +12 patterns                         ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RECOMMENDATIONS                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 1. ✅ System is healthy overall - no immediate action       ║
║ 2. 🔧 Fix email notification channel when convenient        ║
║ 3. 📅 Schedule legacy-api retrain for next week             ║
║ 4. 📊 Consider archiving old telemetry (>90 days)           ║
║ 5. 🎯 Transfer top 5 patterns to underperforming experts    ║
╚══════════════════════════════════════════════════════════════╝

Overall Assessment: EXCELLENT ⭐⭐⭐⭐⭐
System is performing well with minimal issues. Intelligence
capabilities are active and improving. Continue current monitoring.
```

## Related Commands

- `/iris-evaluate-all` - Detailed expert evaluation
- `/iris-auto-retrain` - Fix drifting experts
- `/supabase-status` - Supabase backend details
- `/reflexion-stats` - Reflexion system metrics
- `/telemetry-stats` - Telemetry data analysis
- `/notifications-test` - Test notification channels
