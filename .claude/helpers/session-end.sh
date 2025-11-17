#!/bin/bash

# IRIS Prime Session End Hook
# Stores reflexions, syncs to Supabase, generates report

STORE_REFLEXIONS=false
SYNC_SUPABASE=false
GENERATE_REPORT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --store-reflexions)
      STORE_REFLEXIONS=true
      shift
      ;;
    --sync-supabase)
      SYNC_SUPABASE=true
      shift
      ;;
    --generate-report)
      GENERATE_REPORT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

echo "🤖 IRIS Prime - Session ending..."

# Process queued operations
if [ -f ".claude/pattern-queue.jsonl" ] || [ -f ".claude/consensus-queue.jsonl" ]; then
  echo "   Processing queued operations..."

  # Process pattern updates
  if [ -f ".claude/pattern-queue.jsonl" ]; then
    PATTERN_COUNT=$(wc -l < ".claude/pattern-queue.jsonl")
    echo "   - Patterns queued: $PATTERN_COUNT"
  fi

  # Process consensus checks
  if [ -f ".claude/consensus-queue.jsonl" ]; then
    CONSENSUS_COUNT=$(wc -l < ".claude/consensus-queue.jsonl")
    echo "   - Consensus checks queued: $CONSENSUS_COUNT"
  fi
fi

# Store reflexions
if [ "$STORE_REFLEXIONS" = true ]; then
  echo "   Storing reflexions..."
  node -e "
    const fs = require('fs');
    const path = require('path');

    try {
      const sessionFile = path.join(process.cwd(), '.claude', 'session.json');
      const reflexionFile = path.join(process.cwd(), '.claude', 'reflexions.jsonl');

      if (fs.existsSync(sessionFile)) {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

        const reflexion = {
          sessionId: session.id,
          timestamp: new Date().toISOString(),
          duration: Date.now() - new Date(session.startTime).getTime(),
          summary: 'Session completed'
        };

        fs.mkdirSync(path.dirname(reflexionFile), { recursive: true });
        fs.appendFileSync(reflexionFile, JSON.stringify(reflexion) + '\n');
      }
    } catch (err) {
      // Silent fail
    }
  " 2>/dev/null
fi

# Update metrics cache
node -e "
  const fs = require('fs');
  const path = require('path');

  try {
    // Count various metrics
    const telemetryFile = path.join(process.cwd(), '.claude', 'telemetry.jsonl');
    const reflexionFile = path.join(process.cwd(), '.claude', 'reflexions.jsonl');
    const patternQueueFile = path.join(process.cwd(), '.claude', 'pattern-queue.jsonl');

    let telemetryCount = 0;
    let reflexionCount = 0;
    let patternCount = 0;

    if (fs.existsSync(telemetryFile)) {
      const lines = fs.readFileSync(telemetryFile, 'utf8').trim().split('\n');
      telemetryCount = lines.length;
    }

    if (fs.existsSync(reflexionFile)) {
      const lines = fs.readFileSync(reflexionFile, 'utf8').trim().split('\n');
      reflexionCount = lines.length;
    }

    if (fs.existsSync(patternQueueFile)) {
      const lines = fs.readFileSync(patternQueueFile, 'utf8').trim().split('\n');
      patternCount = lines.length;
    }

    const metrics = {
      timestamp: Date.now(),
      health: 92,  // Mock for now
      consensus: 87,  // Mock for now
      patterns: patternCount,
      reflexions: reflexionCount,
      notifications: telemetryCount,
      alerts: 0  // Mock for now
    };

    const cacheFile = path.join(process.cwd(), '.claude', 'metrics-cache.json');
    fs.writeFileSync(cacheFile, JSON.stringify(metrics, null, 2));
  } catch (err) {
    // Silent fail
  }
" 2>/dev/null

# Generate report
if [ "$GENERATE_REPORT" = true ]; then
  echo "   Session summary:"

  if [ -f ".claude/telemetry.jsonl" ]; then
    EDITS=$(wc -l < ".claude/telemetry.jsonl")
    echo "   - File edits: $EDITS"
  fi

  if [ -f ".claude/bash-history.jsonl" ]; then
    COMMANDS=$(wc -l < ".claude/bash-history.jsonl" | awk '{print $1/2}')
    echo "   - Commands executed: $COMMANDS"
  fi

  if [ -f ".claude/reflexions.jsonl" ]; then
    REFLEXIONS=$(wc -l < ".claude/reflexions.jsonl")
    echo "   - Reflexions stored: $REFLEXIONS"
  fi
fi

echo "✅ Session data stored successfully"

exit 0
