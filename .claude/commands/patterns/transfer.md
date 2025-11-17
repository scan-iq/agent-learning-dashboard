# patterns-transfer

Transfer successful patterns from one project to another.

## Usage

```bash
/patterns-transfer --pattern <id> --target <project> [--validate] [--apply]
```

## Options

- `--pattern` - Pattern ID or name to transfer (required)
- `--target` - Target project/expert (required)
- `--source` - Source project (default: auto-detect)
- `--validate` - Validate compatibility before transfer
- `--apply` - Automatically apply pattern (not just recommend)
- `--adapt` - Auto-adapt pattern to target context

## Examples

### Transfer pattern with validation
```bash
/patterns-transfer \
  --pattern supabase-rpc-batching \
  --target new-api-service \
  --validate
```

### Auto-apply pattern
```bash
/patterns-transfer \
  --pattern concurrent-operations \
  --target mobile-backend \
  --apply --adapt
```

### Cross-domain transfer
```bash
/patterns-transfer \
  --pattern error-recovery \
  --source web-app \
  --target desktop-app \
  --validate --adapt
```

## What This Does

1. **Pattern Retrieval**: Loads pattern from library
2. **Compatibility Check**: Validates target environment
3. **Context Analysis**: Identifies needed adaptations
4. **Transfer Plan**: Creates implementation roadmap
5. **Application**: Optionally applies pattern automatically
6. **Validation**: Verifies successful transfer

Transfer process includes:
- Technical compatibility validation
- Pattern adaptation for target context
- Code template generation
- Integration testing recommendations
- Risk assessment

## When to Use

- **New Projects**: Bootstrap with proven patterns
- **Optimization**: Apply successful patterns to underperforming projects
- **Standardization**: Ensure consistent approaches across projects
- **Knowledge Sharing**: Spread expertise across teams
- **Rapid Development**: Accelerate with proven templates

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Pattern Transfer Analysis                                    ║
╠══════════════════════════════════════════════════════════════╣
║ Pattern: Supabase RPC Batch Calling                         ║
║ Source: iris-prime-console (95.7% success)                  ║
║ Target: new-api-service                                      ║
╠══════════════════════════════════════════════════════════════╣

🔍 Analyzing target environment...
  ✓ Project uses Supabase ✓
  ✓ Has RPC function calls ✓
  ✓ Node.js/TypeScript stack ✓
  ✓ Similar architecture ✓

╔══════════════════════════════════════════════════════════════╗
║ COMPATIBILITY ASSESSMENT                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Technical Compatibility: ✅ 100% (Perfect match)            ║
║ Architecture Match:      ✅ High similarity                 ║
║ Dependencies Met:        ✅ All present                     ║
║ Risk Level:              🟢 Low                             ║
╠══════════════════════════════════════════════════════════════╣
║ Recommendation: PROCEED - Excellent transfer candidate       ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ CURRENT STATE ANALYSIS (Target Project)                      ║
╠══════════════════════════════════════════════════════════════╣
║ Individual RPC Calls Found: 47 locations                    ║
║ Potential Batching Opportunities: 23                         ║
║ Estimated Performance Gain: +68%                             ║
║ Estimated Cost Reduction: -38% API calls                    ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ TRANSFER PLAN                                                ║
╠══════════════════════════════════════════════════════════════╣
║ Phase 1: Create Helper Functions                            ║
║ ─────────────────────────────────────────────────────────────║
║ □ Add batching utility functions                            ║
║ □ Create TypeScript types for batch operations              ║
║ □ Add error handling wrappers                               ║
║   Estimated Time: 30 minutes                                 ║
║                                                              ║
║ Phase 2: Identify High-Impact Locations (Top 10)            ║
║ ─────────────────────────────────────────────────────────────║
║ □ src/api/users.ts:45 - 8 sequential RPC calls             ║
║ □ src/api/analytics.ts:123 - 6 sequential RPC calls        ║
║ □ src/services/data-sync.ts:87 - 5 sequential RPC calls    ║
║   ...7 more locations                                        ║
║   Estimated Impact: +72% speed improvement                   ║
║   Estimated Time: 2 hours                                    ║
║                                                              ║
║ Phase 3: Refactor Medium-Impact Locations (13)              ║
║ ─────────────────────────────────────────────────────────────║
║   Estimated Impact: +58% speed improvement                   ║
║   Estimated Time: 3 hours                                    ║
║                                                              ║
║ Phase 4: Testing & Validation                               ║
║ ─────────────────────────────────────────────────────────────║
║ □ Unit tests for batch functions                            ║
║ □ Integration tests for modified endpoints                  ║
║ □ Performance benchmarking                                   ║
║   Estimated Time: 1.5 hours                                  ║
╠══════════════════════════════════════════════════════════════╣
║ TOTAL ESTIMATED EFFORT: 7 hours                              ║
║ EXPECTED ROI: +68% performance, ongoing -38% API costs      ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ CODE EXAMPLES (Adapted for target)                           ║
╠══════════════════════════════════════════════════════════════╣

Before (Current pattern in target):
─────────────────────────────────────────────────────────────
// src/api/users.ts:45
const userData = await supabase.rpc('get_user', { id })
const permissions = await supabase.rpc('get_permissions', { id })
const settings = await supabase.rpc('get_settings', { id })
// ... 5 more sequential calls

After (With transferred pattern):
─────────────────────────────────────────────────────────────
// src/api/users.ts:45
const [userData, permissions, settings, ...] = await Promise.all([
  supabase.rpc('get_user', { id }),
  supabase.rpc('get_permissions', { id }),
  supabase.rpc('get_settings', { id }),
  // ... remaining calls in parallel
])

Expected Result:
• Latency: 450ms → 78ms (-83%)
• API calls remain same, but execute in parallel
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RISK ASSESSMENT                                              ║
╠══════════════════════════════════════════════════════════════╣
║ 🟢 LOW RISK AREAS                                            ║
║    • Technical compatibility (100% match)                    ║
║    • Well-tested pattern (95.7% success in source)          ║
║    • Standard JavaScript/Promise patterns                    ║
║                                                              ║
║ 🟡 CONSIDERATIONS                                            ║
║    • Test concurrent RPC call limits in Supabase            ║
║    • Ensure error handling for partial failures             ║
║    • Validate transaction boundaries if applicable          ║
║                                                              ║
║ Recommended Mitigation:                                      ║
║ • Start with top 3 high-impact locations                     ║
║ • Monitor performance metrics                                ║
║ • Gradually roll out to remaining locations                  ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ NEXT STEPS                                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Option 1: Manual Implementation                             ║
║   Use the transfer plan above to implement manually          ║
║   Estimated time: 7 hours                                    ║
║                                                              ║
║ Option 2: Auto-Apply (--apply flag)                         ║
║   Automatically refactor top 10 high-impact locations        ║
║   Creates PR with changes for review                         ║
║   Estimated time: 15 minutes + review time                   ║
║                                                              ║
║ Recommendation: Start with Option 2 for quick wins,         ║
║ then manually handle remaining locations.                    ║
╚══════════════════════════════════════════════════════════════╝

✅ Transfer analysis complete
💾 Transfer plan saved to: /transfers/supabase-rpc-batching-new-api-service.md
```

## Related Commands

- `/patterns-discover` - Discover new patterns
- `/patterns-learn` - Learn from pattern library
- `/iris-retrain` - Retrain expert with transferred patterns
- `/reflexion-reuse` - Apply reflexion learning
