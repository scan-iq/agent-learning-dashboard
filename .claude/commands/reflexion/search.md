# reflexion-search

Search for similar past reflexions using semantic vector search.

## Usage

```bash
/reflexion-search --query "<description>" [--limit <num>] [--verdict <filter>]
```

## Options

- `--query` - Search query (natural language or keywords)
- `--limit` - Maximum results to return (default: 10)
- `--verdict` - Filter by verdict: passed, failed, partial, all (default: all)
- `--similarity` - Minimum similarity threshold (0-1, default: 0.7)
- `--domain` - Filter by domain/project
- `--date-range` - Filter by date range (e.g., "last 30 days")

## Examples

### Search for authentication patterns
```bash
/reflexion-search --query "authentication and OAuth implementation"
```

### Find failed database migrations
```bash
/reflexion-search \
  --query "database migration" \
  --verdict failed \
  --limit 5
```

### Recent successful API patterns
```bash
/reflexion-search \
  --query "REST API design" \
  --verdict passed \
  --date-range "last 90 days" \
  --similarity 0.8
```

## What This Does

1. **Vector Search**: Uses AgentDB semantic search to find similar reflexions
2. **Ranking**: Sorts by similarity and relevance
3. **Filtering**: Applies verdict, date, and domain filters
4. **Context Extraction**: Highlights relevant patterns and insights
5. **Recommendations**: Suggests how to apply learnings

The search considers:
- Task descriptions and context
- Self-reflection content
- Patterns identified
- Trajectory steps
- Outcomes and verdicts

## When to Use

- **Before Starting Tasks**: Learn from similar past work
- **Debugging Failures**: Find how similar issues were resolved
- **Pattern Discovery**: Find recurring successful approaches
- **Knowledge Transfer**: Share learning across teams
- **Code Review**: Validate against past experience

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Reflexion Search Results                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Query: "authentication and OAuth implementation"             ║
║ Found: 8 reflexions (similarity ≥ 0.70)                     ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ #1 - OAuth2 User Authentication (Similarity: 0.94) ⭐⭐⭐    │
├──────────────────────────────────────────────────────────────┤
│ Date: 2025-10-28 | Verdict: ✅ PASSED                       │
│ Project: iris-prime-console                                  │
│ Duration: 2h 15m | Complexity: High                         │
├──────────────────────────────────────────────────────────────┤
│ Task Summary:                                                │
│ Implemented OAuth2 authentication with JWT tokens for API   │
│ access. Integrated with Supabase auth and handled refresh   │
│ token rotation.                                              │
├──────────────────────────────────────────────────────────────┤
│ Key Learnings:                                               │
│ • Batch Supabase operations reduced API calls by 60%        │
│ • Concurrent processing improved speed by 40%               │
│ • JWT validation pattern enhanced security                  │
├──────────────────────────────────────────────────────────────┤
│ Applicable Patterns:                                         │
│ ✓ Supabase batch operations                                 │
│ ✓ Token refresh handling                                    │
│ ✓ Error recovery with exponential backoff                   │
├──────────────────────────────────────────────────────────────┤
│ Reuse Recommendation:                                        │
│ Highly applicable - Use this trajectory as template for     │
│ OAuth2 implementations. Pay special attention to the        │
│ batch operations pattern which yielded 60% efficiency gain. │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ #2 - API Authentication Middleware (Similarity: 0.87) ⭐⭐   │
├──────────────────────────────────────────────────────────────┤
│ Date: 2025-09-15 | Verdict: ✅ PASSED                       │
│ Project: api-gateway                                         │
│ Duration: 1h 45m | Complexity: Medium                       │
├──────────────────────────────────────────────────────────────┤
│ Key Learnings:                                               │
│ • Middleware pattern simplified auth across all endpoints   │
│ • Caching user sessions improved latency by 200ms           │
│ • Rate limiting prevented abuse                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ #3 - Social Auth Integration (Similarity: 0.82) ⭐⭐         │
├──────────────────────────────────────────────────────────────┤
│ Date: 2025-08-22 | Verdict: ⚠️  PARTIAL                     │
│ Project: user-portal                                         │
│ Duration: 3h 30m | Complexity: High                         │
├──────────────────────────────────────────────────────────────┤
│ Key Learnings:                                               │
│ • Third-party OAuth flows require careful error handling    │
│ • State parameter essential for CSRF protection             │
│ ⚠️  Learned: Account linking needs additional validation    │
└──────────────────────────────────────────────────────────────┘

╠══════════════════════════════════════════════════════════════╣
║ AGGREGATED INSIGHTS (from all 8 results)                     ║
╠══════════════════════════════════════════════════════════════╣
║ Success Rate: 87.5% (7/8 passed)                            ║
║ Avg Duration: 2h 18m                                         ║
║ Common Patterns:                                             ║
║   • Supabase batch operations (6 times)                      ║
║   • Error recovery patterns (5 times)                        ║
║   • JWT validation (4 times)                                 ║
║   • Token refresh handling (3 times)                         ║
╠══════════════════════════════════════════════════════════════╣
║ RECOMMENDED ACTIONS                                          ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Review reflexion #1 (highest similarity, strong match)   ║
║ 2. Apply "Supabase batch operations" pattern                ║
║ 3. Implement error recovery from reflexion #1, #2           ║
║ 4. Consider middleware pattern from reflexion #2            ║
║ 5. Learn from partial success in reflexion #3               ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/reflexion-track` - Track new reflexions
- `/reflexion-reuse` - Apply reflexion to new context
- `/reflexion-analyze` - Analyze pattern clusters
- `/iris-patterns` - View all discovered patterns
- `/pattern-transfer` - Transfer patterns between projects
