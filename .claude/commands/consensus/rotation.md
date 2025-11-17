# consensus-rotation

Get intelligent expert rotation recommendations to optimize decision quality.

## Usage

```bash
/consensus-rotation [--task <type>] [--current <experts>] [--pool <available>]
```

## Options

- `--task` - Task type or domain (e.g., api, database, frontend)
- `--current` - Currently assigned experts
- `--pool` - Available expert pool (default: all active)
- `--optimize-for` - Optimization goal: accuracy, diversity, speed
- `--min-experts` - Minimum experts to recommend (default: 3)

## Examples

### Get rotation recommendations for API task
```bash
/consensus-rotation --task api-design
```

### Optimize current expert set
```bash
/consensus-rotation \
  --task database-schema \
  --current db-expert-1,api-expert \
  --optimize-for accuracy
```

### Full pool analysis
```bash
/consensus-rotation \
  --task critical-security \
  --pool all \
  --min-experts 5
```

## What This Does

1. **Analyzes Task**: Determines required expertise
2. **Evaluates Experts**: Scores experts for this task type
3. **Optimizes Selection**: Balances accuracy, diversity, and efficiency
4. **Recommends Rotation**: Suggests expert assignments
5. **Explains Reasoning**: Provides rationale for recommendations

Considers:
- Expert specialization and past performance
- Task-expert compatibility
- Expert diversity (avoid groupthink)
- Load balancing across experts
- Consensus quality patterns

## When to Use

- **Task Planning**: Choose optimal experts before starting
- **Performance Issues**: Improve low-quality decisions
- **Load Balancing**: Distribute work across experts
- **Quality Assurance**: Ensure proper expert coverage
- **Continuous Improvement**: Optimize expert assignments

## Output

```
╔══════════════════════════════════════════════════════════════╗
║ Expert Rotation Recommendations                              ║
╠══════════════════════════════════════════════════════════════╣
║ Task Type: api-design                                        ║
║ Optimization: accuracy                                       ║
║ Current Experts: 2                                           ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ RECOMMENDED EXPERT TEAM                                      ║
╠══════════════════════════════════════════════════════════════╣
║ 1. backend-specialist    ⭐⭐⭐⭐⭐ (98% task accuracy)     ║
║    Specialization: API design, REST, authentication          ║
║    Past Performance: 156 API tasks, 98.2% success           ║
║    Reason: Top performer for API architecture                ║
║                                                              ║
║ 2. security-expert       ⭐⭐⭐⭐⭐ (96% task accuracy)     ║
║    Specialization: Security, OAuth, vulnerability            ║
║    Past Performance: 89 security tasks, 96.1% success       ║
║    Reason: Critical for auth/security decisions              ║
║                                                              ║
║ 3. api-architect         ⭐⭐⭐⭐ (94% task accuracy)       ║
║    Specialization: API design, scalability, patterns         ║
║    Past Performance: 203 design tasks, 94.3% success        ║
║    Reason: Brings diverse perspective on architecture        ║
║                                                              ║
║ 4. frontend-integration  ⭐⭐⭐ (87% task accuracy)         ║
║    Specialization: API consumption, client integration       ║
║    Past Performance: 127 integration tasks, 87.4% success   ║
║    Reason: Ensures API usability from client perspective     ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ TEAM ANALYSIS                                                ║
╠══════════════════════════════════════════════════════════════╣
║ Expected Consensus Score: 0.94 (Strong)                      ║
║ Expertise Coverage:       98% (Excellent)                    ║
║ Diversity Score:          0.82 (Good variety)                ║
║ Load Balance:             ✓ (All experts available)          ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ ALTERNATIVE CONFIGURATIONS                                   ║
╠══════════════════════════════════════════════════════════════╣
║ Faster (3 experts):       backend-specialist, security,      ║
║                          api-architect                        ║
║   Expected Score: 0.93 | Speed: +25%                         ║
║                                                              ║
║ Higher Diversity (5):    Current + performance-expert,       ║
║                          database-architect                   ║
║   Expected Score: 0.92 | Diversity: +18%                     ║
╠══════════════════════════════════════════════════════════════╣

╔══════════════════════════════════════════════════════════════╗
║ ROTATION INSIGHTS                                            ║
╠══════════════════════════════════════════════════════════════╣
║ • backend-specialist has highest API task success rate       ║
║ • security-expert essential for authentication decisions     ║
║ • frontend perspective improves usability by 12%             ║
║ • This combination achieved 96%+ consensus in past           ║
╚══════════════════════════════════════════════════════════════╝
```

## Related Commands

- `/consensus-record` - Record team decisions
- `/consensus-calculate` - Calculate team consensus
- `/iris-experts` - View all available experts
- `/iris-evaluate` - Evaluate expert performance
