# iris-transfer

Transfer learning and patterns between expert models.

## Usage

```bash
/iris-transfer --source <expert> --target <expert> [--patterns <list>]
```

## Options

- `--source` - Source expert ID (required)
- `--target` - Target expert ID (required)
- `--patterns` - Specific patterns to transfer (default: top performing)
- `--validate` - Validate compatibility before transfer
- `--apply` - Auto-apply transferred learning

## Examples

### Transfer top patterns
```bash
/iris-transfer \
  --source iris-prime-console \
  --target new-project
```

### Transfer specific patterns
```bash
/iris-transfer \
  --source iris-prime-console \
  --target legacy-api \
  --patterns supabase-batching,concurrent-ops \
  --validate
```

## What This Does

1. **Pattern Extraction**: Extracts successful patterns from source expert
2. **Compatibility Check**: Validates target environment
3. **Adaptation**: Adapts patterns for target context
4. **Transfer**: Integrates learning into target expert
5. **Validation**: Verifies successful transfer

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Expert Knowledge Transfer                                    ║
╠══════════════════════════════════════════════════════════════╣
║ Source: iris-prime-console (96.2% performance)               ║
║ Target: new-project (baseline)                               ║
╠══════════════════════════════════════════════════════════════╣

🔍 Extracting patterns from source expert...
  ✓ Found 34 patterns
  ✓ Selected top 10 performing patterns
  ✓ Compatibility: 87% (good match)

⚡ Transferring knowledge...
  ✓ Supabase batch operations (+60% efficiency)
  ✓ Concurrent file operations (+32% speed)
  ✓ Error recovery patterns (+45% reliability)
  ✓ ... 7 more patterns

✅ Transfer complete! Target expert updated.
Expected improvement: +15-20% performance
```

## Related Commands

- `/patterns-transfer` - Transfer specific patterns
- `/iris-retrain` - Retrain with transferred learning
- `/iris-patterns` - View available patterns
