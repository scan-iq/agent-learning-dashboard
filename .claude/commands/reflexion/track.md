# reflexion-track

Track a new reflexion trajectory with self-reflection and learning.

## Usage

```bash
/reflexion-track --task "<description>" --verdict <result> [--reflection "<text>"]
```

## Options

- `--task` - Task description (required)
- `--verdict` - Outcome: passed, failed, partial (required)
- `--reflection` - Self-reflection on what worked/didn't work
- `--context` - Additional context (JSON)
- `--trajectory` - Step-by-step trajectory data
- `--auto-analyze` - Automatically analyze and learn patterns

## Examples

### Track successful trajectory
```bash
/reflexion-track \
  --task "Implement user authentication with OAuth2" \
  --verdict passed \
  --reflection "Concurrent API calls significantly improved performance. Learned to batch Supabase operations."
```

### Track failed trajectory with learning
```bash
/reflexion-track \
  --task "Database migration with zero downtime" \
  --verdict failed \
  --reflection "Attempted blue-green deployment but missed foreign key constraints. Need better validation." \
  --auto-analyze
```

### Track with detailed trajectory
```bash
/reflexion-track \
  --task "Build REST API with rate limiting" \
  --verdict passed \
  --trajectory '[{"step": 1, "action": "Design schema", "outcome": "success"}, ...]' \
  --context '{"complexity": "high", "duration": "2h"}'
```

## What This Does

1. **Captures Trajectory**: Records the full task execution path
2. **Self-Reflection**: Stores insights on what worked/failed
3. **Pattern Extraction**: Identifies successful patterns
4. **Vector Embedding**: Creates semantic representation for search
5. **Storage**: Saves to Supabase and AgentDB
6. **Learning**: Feeds IRIS expert models for improvement

Trajectory data includes:
- Task description and context
- Step-by-step actions taken
- Outcomes and results
- Self-reflection and insights
- Patterns identified
- Verdict (pass/fail/partial)

## When to Use

- **After Completing Tasks**: Capture learning from work
- **After Failures**: Document what went wrong and why
- **Successful Patterns**: Record approaches that worked well
- **Complex Tasks**: Track multi-step processes for reuse
- **Continuous Learning**: Build organizational knowledge

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion Trajectory Tracked                                 ║
╠══════════════════════════════════════════════════════════════╣
║ Reflexion ID: reflex_9a3b7c2e                               ║
║ Timestamp: 2025-11-17 16:30:00                              ║
╠══════════════════════════════════════════════════════════════╣
║ Task: Implement user authentication with OAuth2              ║
║ Verdict: ✅ PASSED                                           ║
╠══════════════════════════════════════════════════════════════╣
║ SELF-REFLECTION                                              ║
╠══════════════════════════════════════════════════════════════╣
║ Concurrent API calls significantly improved performance.     ║
║ Learned to batch Supabase operations. This reduced API      ║
║ round trips by 60% and improved response time by 150ms.     ║
║ Key insight: Always batch database operations when possible. ║
╠══════════════════════════════════════════════════════════════╣
║ PATTERNS IDENTIFIED                                          ║
╠══════════════════════════════════════════════════════════════╣
║ ✓ Supabase batch operations (+60% efficiency)               ║
║ ✓ Concurrent API calls (+40% speed)                         ║
║ ✓ JWT token validation (security pattern)                   ║
╠══════════════════════════════════════════════════════════════╣
║ TRAJECTORY SUMMARY                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Steps: 8                                                     ║
║ Success Rate: 100% (8/8 successful)                         ║
║ Duration: 2h 15m                                             ║
║ Complexity: High                                             ║
╠══════════════════════════════════════════════════════════════╣
║ LEARNING INTEGRATION                                         ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Saved to Supabase (reflexions table)                     ║
║ ✅ Vector embedded in AgentDB (semantic search)             ║
║ ✅ Patterns extracted for IRIS learning                     ║
║ ✅ Available for future reflexion searches                  ║
╠══════════════════════════════════════════════════════════════╣
║ REUSE OPPORTUNITIES                                          ║
╠══════════════════════════════════════════════════════════════╣
║ This trajectory can be reused for:                           ║
║ • Similar authentication implementations                     ║
║ • OAuth2 integration tasks                                   ║
║ • API performance optimization                               ║
║ • Supabase integration patterns                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/reflexion-search` - Find similar past reflexions
- `/reflexion-reuse` - Apply learning to new context
- `/reflexion-analyze` - Deep pattern analysis
- `/iris-patterns` - See patterns across all reflexions
- `/pattern-discover` - Discover patterns from trajectories
