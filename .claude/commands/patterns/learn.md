# patterns-learn

Learn from the pattern library and integrate knowledge into expert models.

## Usage

```bash
/patterns-learn [--domain <name>] [--pattern <id>] [--expert <id>]
```

## Options

- `--domain` - Focus on specific domain patterns
- `--pattern` - Learn specific pattern(s)
- `--expert` - Target expert to train (default: all)
- `--interactive` - Interactive learning session
- `--update-training` - Update expert training data

## Examples

### Learn all patterns for domain
```bash
/patterns-learn --domain supabase
```

### Learn specific pattern
```bash
/patterns-learn --pattern concurrent-operations --expert iris-prime
```

### Interactive learning session
```bash
/patterns-learn --interactive
```

## What This Does

1. **Pattern Retrieval**: Loads patterns from library
2. **Knowledge Integration**: Adds patterns to expert training data
3. **Example Generation**: Creates code examples and templates
4. **Best Practices**: Codifies successful approaches
5. **Expert Update**: Improves expert models with patterns

## When to Use

- **Expert Training**: Teach new experts proven patterns
- **Knowledge Transfer**: Share organizational knowledge
- **Onboarding**: Help new experts learn quickly
- **Continuous Improvement**: Keep experts updated with latest patterns

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Pattern Learning Session                                     ║
╠══════════════════════════════════════════════════════════════╣
║ Domain: Supabase Integration                                 ║
║ Patterns: 8 available                                        ║
║ Target Experts: All (12 experts)                            ║
╠══════════════════════════════════════════════════════════════╣

📚 Loading pattern library...
  ✓ Found 8 Supabase patterns
  ✓ Loaded examples and templates
  ✓ Prepared training data

🧠 Integrating knowledge into experts...

[1/8] Supabase Batch Operations
  ✓ Added to 6 experts (6 use Supabase)
  ✓ Generated 12 code examples
  ✓ Updated best practices documentation

[2/8] RPC Batch Calling
  ✓ Added to 5 experts
  ✓ Generated 8 code examples

... [continues for all patterns]

╔══════════════════════════════════════════════════════════════╗
║ LEARNING SUMMARY                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Patterns Learned: 8                                         ║
║ Experts Updated: 6/12                                       ║
║ Code Examples: 47 generated                                 ║
║ Training Data: Updated                                      ║
╠══════════════════════════════════════════════════════════════╣
║ Next: Run /iris-auto-retrain to integrate patterns          ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/patterns-discover` - Discover new patterns
- `/iris-retrain` - Retrain expert with patterns
- `/iris-patterns` - View all patterns
