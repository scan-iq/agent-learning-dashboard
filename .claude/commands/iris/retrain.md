# iris-retrain

Manually retrain a specific expert model using latest data and patterns.

## Usage

```bash
/iris-retrain <project-name> [--strategy <type>] [--epochs <num>] [--transfer]
```

## Options

- `project-name` - Target project expert to retrain (required)
- `--strategy` - Retraining strategy: full, incremental, transfer (default: incremental)
- `--epochs` - Number of training epochs (default: auto)
- `--transfer` - Include patterns from other successful experts
- `--baseline` - Create new baseline after training
- `--validate` - Run validation before deployment

## Examples

### Basic incremental retrain
```bash
/iris-retrain iris-prime-console
```

### Full retrain with transfer learning
```bash
/iris-retrain old-frontend --strategy full --transfer
```

### Controlled retraining with validation
```bash
/iris-retrain legacy-api --epochs 50 --validate --baseline
```

### Transfer patterns from top performers
```bash
/iris-retrain my-project --strategy transfer --transfer
```

## What This Does

1. **Data Collection**: Gathers recent reflexions, telemetry, and consensus data
2. **Pattern Analysis**: Identifies successful and failed patterns
3. **Model Update**: Retrains expert using selected strategy:
   - **Full**: Complete retraining from scratch
   - **Incremental**: Update weights with new data
   - **Transfer**: Learn from other experts' successes
4. **Validation**: Tests new model against validation set
5. **Deployment**: Replaces old expert if validation passes
6. **Versioning**: Creates new version with lineage tracking

The retraining process includes:
- **Reflexion Learning**: Incorporates trajectory improvements
- **Consensus Integration**: Learns from multi-expert decisions
- **Pattern Discovery**: Identifies and reinforces successful patterns
- **Error Correction**: Addresses failure modes
- **Performance Optimization**: Improves speed and efficiency

## When to Use

- **Performance Drift**: Expert showing degraded performance
- **New Patterns Available**: After discovering effective patterns
- **Domain Shift**: Project requirements have changed
- **After Major Updates**: Codebase or API changes
- **Scheduled Maintenance**: Regular model updates
- **Failed Tasks**: After significant failures to learn from

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ IRIS Expert Retraining: iris-prime-console                  ║
╠══════════════════════════════════════════════════════════════╣
║ Strategy: Incremental with Transfer Learning                ║
║ Started: 2025-11-17 14:45:00                                ║
╠══════════════════════════════════════════════════════════════╣

[1/5] Collecting Training Data...
  ✓ Reflexions: 247 trajectories loaded
  ✓ Telemetry: 1,823 events processed
  ✓ Consensus: 89 decisions analyzed
  ✓ Patterns: 34 transferable patterns found

[2/5] Analyzing Patterns...
  ✓ Successful patterns: 28
  ✓ Failed patterns: 6
  ✓ Transfer patterns: 12 (from top 3 experts)
  ✓ Pattern conflicts resolved: 2

[3/5] Training Expert Model...
  Epoch 1/25: Loss 0.234 | Acc 87.2%
  Epoch 10/25: Loss 0.089 | Acc 93.8%
  Epoch 25/25: Loss 0.034 | Acc 96.1%
  ✓ Training complete

[4/5] Validation...
  ✓ Test set accuracy: 95.8%
  ✓ Performance vs baseline: +8.3%
  ✓ Drift score: 0.08 (improved from 0.31)
  ✓ All validation checks passed

[5/5] Deployment...
  ✓ Model saved to Supabase
  ✓ Version: 2.4.0 (from 2.3.1)
  ✓ Lineage tracked
  ✓ Expert activated

╠══════════════════════════════════════════════════════════════╣
║ RETRAINING RESULTS                                           ║
╠══════════════════════════════════════════════════════════════╣
║ Previous Performance: 87.8%                                  ║
║ New Performance:      96.1%                                  ║
║ Improvement:          +8.3%                                  ║
║                                                              ║
║ Patterns Learned:     40 (28 new + 12 transferred)          ║
║ Training Time:        2m 34s                                 ║
║ Model Size:           4.2 MB                                 ║
╠══════════════════════════════════════════════════════════════╣
║ KEY IMPROVEMENTS                                             ║
╠══════════════════════════════════════════════════════════════╣
║ • Error rate reduced by 62%                                  ║
║ • Token efficiency improved by 11%                           ║
║ • Latency decreased by 18%                                   ║
║ • Pattern transfer successful for async operations          ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/iris-auto-retrain` - Automatic retraining of drifting experts
- `/iris-evaluate` - Evaluate before/after retraining
- `/iris-patterns` - View available patterns for transfer
- `/iris-drift` - Check if retraining is needed
- `/consensus-lineage` - Track expert version lineage
