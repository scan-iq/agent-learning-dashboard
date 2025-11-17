# consensus-record

Record a multi-expert consensus decision with voting, rationale, and metadata.

## Usage

```bash
/consensus-record --task "<description>" --experts <list> --votes <scores>
```

## Options

- `--task` - Task description or identifier (required)
- `--experts` - Comma-separated list of expert IDs
- `--votes` - Comma-separated confidence scores (0-1)
- `--rationale` - Decision rationale and reasoning
- `--metadata` - Additional context (JSON)
- `--auto-calculate` - Auto-calculate consensus score

## Examples

### Record a consensus decision
```bash
/consensus-record \
  --task "API design for authentication" \
  --experts expert-1,expert-2,expert-3 \
  --votes 0.95,0.87,0.92 \
  --rationale "OAuth2 with JWT tokens chosen for security and scalability"
```

### Record with metadata
```bash
/consensus-record \
  --task "Database schema for users" \
  --experts db-expert,security-expert,api-expert \
  --votes 0.88,0.91,0.85 \
  --metadata '{"complexity": "high", "risk": "medium"}' \
  --auto-calculate
```

## What This Does

1. **Captures Decision**: Records the multi-expert consensus
2. **Calculates Score**: Computes weighted consensus score
3. **Stores Rationale**: Preserves reasoning for future reference
4. **Tracks Lineage**: Links to expert versions used
5. **Enables Learning**: Feeds data to IRIS for pattern discovery
6. **Supports Audit**: Creates audit trail for decisions

## When to Use

- **Critical Decisions**: Important architecture or design choices
- **Multi-Expert Tasks**: When multiple experts collaborate
- **Learning Opportunities**: Capture successful decision patterns
- **Quality Assurance**: Validate decisions with expert consensus
- **Historical Context**: Build decision knowledge base

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Consensus Decision Recorded                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Task: API design for authentication                          ║
║ Consensus ID: cons_7d8f9e2a                                  ║
║ Timestamp: 2025-11-17 16:00:00                              ║
╠══════════════════════════════════════════════════════════════╣
║ EXPERT VOTES                                                 ║
╠══════════════════════════════════════════════════════════════╣
║ expert-1 (backend-specialist): 0.95 ⭐⭐⭐⭐⭐              ║
║ expert-2 (security-expert):    0.87 ⭐⭐⭐⭐                ║
║ expert-3 (api-architect):      0.92 ⭐⭐⭐⭐⭐              ║
╠══════════════════════════════════════════════════════════════╣
║ CONSENSUS SCORE: 0.91 (Strong Consensus ✓)                  ║
╠══════════════════════════════════════════════════════════════╣
║ Rationale:                                                   ║
║ OAuth2 with JWT tokens chosen for security and scalability. ║
║ Provides industry-standard auth with stateless scaling.     ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Saved to Supabase                                         ║
║ 🔗 Linked to expert lineage                                  ║
║ 📊 Available for pattern discovery                           ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/consensus-calculate` - Calculate consensus scores
- `/consensus-lineage` - View expert version lineage
- `/consensus-search` - Search historical decisions
- `/iris-patterns` - Discover decision patterns
