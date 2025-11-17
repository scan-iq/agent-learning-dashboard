# consensus-search

Search historical consensus decisions for insights and patterns.

## Usage

```bash
/consensus-search --query "<text>" [--score <min>] [--limit <num>]
```

## Options

- `--query` - Search query (natural language or keywords)
- `--score` - Minimum consensus score filter (0-1)
- `--limit` - Maximum results (default: 10)
- `--date-range` - Filter by date
- `--experts` - Filter by expert participants

## Examples

### Search for API decisions
```bash
/consensus-search --query "API design decisions"
```

### High-consensus decisions only
```bash
/consensus-search \
  --query "authentication" \
  --score 0.90 \
  --limit 5
```

## What This Does

Searches consensus database using:
- Semantic vector search
- Keyword matching
- Score filtering
- Expert filtering

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Consensus Decision Search Results                            ║
╠══════════════════════════════════════════════════════════════╣
║ Query: "API design decisions"                                ║
║ Found: 8 decisions                                           ║
╠══════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────┐
│ #1 OAuth2 Authentication API (Score: 0.91) ⭐⭐⭐           │
├──────────────────────────────────────────────────────────────┤
│ Date: 2025-10-28                                             │
│ Experts: 3 (backend, security, api-architect)                │
│ Decision: Use OAuth2 with JWT tokens                         │
│ Rationale: Industry standard, scalable, secure               │
└──────────────────────────────────────────────────────────────┘

... [7 more results]

╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/consensus-record` - Record new decisions
- `/reflexion-search` - Search reflexions
- `/iris-patterns` - View patterns
