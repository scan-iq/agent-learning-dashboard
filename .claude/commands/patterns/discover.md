# patterns-discover

Deep pattern discovery from successful trajectories and reflexions.

## Usage

```bash
/patterns-discover [--source <type>] [--threshold <value>] [--domain <name>]
```

## Options

- `--source` - Data source: reflexions, telemetry, consensus, all (default: all)
- `--threshold` - Success threshold for pattern (default: 0.80)
- `--domain` - Focus on specific domain
- `--min-occurrences` - Minimum pattern occurrences (default: 3)
- `--export` - Export discovered patterns

## Examples

### Discover all patterns
```bash
/patterns-discover
```

### Focus on high-success patterns
```bash
/patterns-discover --threshold 0.90 --min-occurrences 5
```

### Domain-specific discovery
```bash
/patterns-discover --domain supabase --source reflexions
```

## What This Does

1. **Data Mining**: Analyzes reflexions, telemetry, and consensus data
2. **Pattern Extraction**: Identifies recurring successful approaches
3. **Validation**: Tests patterns across multiple contexts
4. **Codification**: Converts patterns into reusable templates
5. **Impact Analysis**: Measures pattern effectiveness
6. **Storage**: Saves patterns to library

Discovery process:
- Analyzes successful trajectories (verdict: passed)
- Finds common sequences and approaches
- Validates across different projects
- Measures impact on key metrics
- Creates pattern templates
- Ranks by effectiveness

## When to Use

- **Weekly**: Discover new patterns from recent work
- **After Major Successes**: Codify what worked well
- **Before Training**: Find patterns to teach experts
- **Knowledge Sharing**: Create pattern library
- **Continuous Improvement**: Systematically improve practices

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Pattern Discovery Analysis                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Analysis Period: Last 30 days                                ║
║ Data Sources: Reflexions (247), Telemetry (1.8k events)     ║
║ Success Threshold: ≥80%                                      ║
║ Min Occurrences: 3                                           ║
╠══════════════════════════════════════════════════════════════╣

🔍 Analyzing data sources...
  ✓ Loaded 247 reflexions (215 passed)
  ✓ Processed 1,823 telemetry events
  ✓ Analyzed 89 consensus decisions

🧠 Mining patterns...
  ✓ Extracted 127 candidate patterns
  ✓ Validated across contexts
  ✓ Filtered by threshold (12 patterns meet criteria)

📊 Computing impact metrics...
  ✓ Performance analysis complete
  ✓ Success correlation calculated

╔══════════════════════════════════════════════════════════════╗
║ NEWLY DISCOVERED PATTERNS (12 Total)                         ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ 🆕 Pattern #1: Supabase RPC Batch Calling                   │
├──────────────────────────────────────────────────────────────┤
│ Domain: Database Operations                                  │
│ Occurrences: 23 (across 5 projects)                         │
│ Success Rate: 95.7% (22/23 successful)                      │
│ Impact: +73% speed, -42% API calls                          │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Instead of calling Supabase RPC functions individually,     │
│ batch multiple RPC calls in a single request using          │
│ Promise.all() and Supabase's transaction support.          │
├──────────────────────────────────────────────────────────────┤
│ Code Template:                                               │
│ // Instead of:                                               │
│ await supabase.rpc('function1', params1)                    │
│ await supabase.rpc('function2', params2)                    │
│                                                              │
│ // Do:                                                       │
│ await Promise.all([                                          │
│   supabase.rpc('function1', params1),                       │
│   supabase.rpc('function2', params2)                        │
│ ])                                                           │
├──────────────────────────────────────────────────────────────┤
│ When to Use:                                                 │
│ • Multiple independent RPC calls                             │
│ • Data aggregation from multiple sources                     │
│ • Batch data processing                                      │
├──────────────────────────────────────────────────────────────┤
│ Transfer Potential: ⭐⭐⭐⭐⭐ (Universal)                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🆕 Pattern #2: AgentDB Vector Caching                       │
├──────────────────────────────────────────────────────────────┤
│ Domain: Vector Search, Performance                           │
│ Occurrences: 18 (across 4 projects)                         │
│ Success Rate: 94.4% (17/18 successful)                      │
│ Impact: +89% speed, -67% embedding costs                    │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Cache vector embeddings locally and reuse them instead of   │
│ regenerating embeddings for the same content. Use content   │
│ hash as cache key.                                           │
├──────────────────────────────────────────────────────────────┤
│ Transfer Potential: ⭐⭐⭐⭐ (High)                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🆕 Pattern #3: Progressive Error Recovery                   │
├──────────────────────────────────────────────────────────────┤
│ Domain: Error Handling, Reliability                          │
│ Occurrences: 31 (across 7 projects)                         │
│ Success Rate: 93.5% (29/31 successful)                      │
│ Impact: -78% failures, +34% reliability                     │
├──────────────────────────────────────────────────────────────┤
│ Description:                                                 │
│ Implement tiered error recovery: retry → fallback →         │
│ graceful degradation → user notification. Each tier adds    │
│ resilience without overwhelming the system.                  │
├──────────────────────────────────────────────────────────────┤
│ Transfer Potential: ⭐⭐⭐⭐⭐ (Universal)                   │
└──────────────────────────────────────────────────────────────┘

╠══════════════════════════════════════════════════════════════╣
║ PATTERN CATEGORIES                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Performance Optimization: 5 patterns                         ║
║ Error Handling:           3 patterns                         ║
║ Database Operations:      2 patterns                         ║
║ Security:                 1 pattern                          ║
║ Testing:                  1 pattern                          ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ IMPACT SUMMARY                                               ║
╠══════════════════════════════════════════════════════════════╣
║ Avg Success Rate: 94.2% (across all patterns)               ║
║ Avg Speed Improvement: +58%                                  ║
║ Avg Cost Reduction: -31%                                     ║
║ Avg Reliability Gain: +27%                                   ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RECOMMENDATIONS                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Transfer "Supabase RPC Batching" to all Supabase projects║
║ 2. Implement "Vector Caching" in vector-heavy applications  ║
║ 3. Apply "Progressive Error Recovery" universally            ║
║ 4. Add all patterns to IRIS expert training data            ║
║ 5. Create pattern documentation for team reference          ║
╠══════════════════════════════════════════════════════════════╣

✅ Patterns saved to library
📊 Export available: /patterns/discovered-2025-11-17.json
```

## Related Commands

- `/patterns-transfer` - Transfer patterns to projects
- `/patterns-learn` - Learn from pattern library
- `/iris-patterns` - View all patterns
- `/reflexion-search` - Find pattern examples
