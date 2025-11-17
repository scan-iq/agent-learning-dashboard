# consensus-calculate

Calculate consensus score from expert votes and analyze decision quality.

## Usage

```bash
/consensus-calculate --votes <scores> [--weights <values>] [--method <type>]
```

## Options

- `--votes` - Expert confidence scores (0-1, comma-separated)
- `--weights` - Expert weights (optional, defaults to equal)
- `--method` - Calculation method: weighted, median, unanimous (default: weighted)
- `--threshold` - Minimum threshold for consensus (default: 0.75)
- `--show-analysis` - Display detailed quality analysis

## Examples

### Basic consensus calculation
```bash
/consensus-calculate --votes 0.95,0.87,0.92
```

### Weighted consensus
```bash
/consensus-calculate \
  --votes 0.95,0.87,0.92 \
  --weights 1.5,1.0,1.2 \
  --method weighted
```

### With quality analysis
```bash
/consensus-calculate \
  --votes 0.88,0.91,0.85,0.89 \
  --threshold 0.85 \
  --show-analysis
```

## What This Does

Calculates consensus using various methods:

**Weighted Average** (default):
```
score = Σ(vote_i × weight_i) / Σ(weight_i)
```

**Median**: Uses median of all votes (robust to outliers)

**Unanimous**: Requires all votes above threshold

Also provides:
- Variance analysis (agreement level)
- Outlier detection
- Confidence intervals
- Quality assessment

## When to Use

- **Decision Validation**: Check if experts agree
- **Quality Control**: Ensure decisions meet standards
- **Outlier Detection**: Find disagreeing experts
- **Method Comparison**: Try different consensus approaches

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Consensus Calculation Results                                ║
╠══════════════════════════════════════════════════════════════╣
║ Method: Weighted Average                                     ║
║ Expert Votes: 4                                              ║
╠══════════════════════════════════════════════════════════════╣
║ CONSENSUS SCORE: 0.91                                        ║
║ Quality: Strong Consensus ⭐⭐⭐⭐                           ║
╠══════════════════════════════════════════════════════════════╣
║ STATISTICAL ANALYSIS                                         ║
╠══════════════════════════════════════════════════════════════╣
║ Mean:       0.91                                             ║
║ Median:     0.905                                            ║
║ Std Dev:    0.024 (low variance - high agreement)           ║
║ Min:        0.85                                             ║
║ Max:        0.95                                             ║
║ Range:      0.10                                             ║
╠══════════════════════════════════════════════════════════════╣
║ QUALITY ASSESSMENT                                           ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Above threshold (0.85): YES                               ║
║ ✅ Low variance: High expert agreement                       ║
║ ✅ No outliers detected                                      ║
║ ✅ Recommendation: Proceed with high confidence              ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/consensus-record` - Record decisions with consensus
- `/consensus-quality` - Analyze decision quality
- `/consensus-search` - Find similar past decisions
