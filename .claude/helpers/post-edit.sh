#!/bin/bash

# IRIS Prime Post-Edit Hook
# Logs telemetry, updates patterns, checks consensus after file edits

FILE_PATH=""
LOG_TELEMETRY=false
UPDATE_PATTERNS=false
CHECK_CONSENSUS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --file)
      FILE_PATH="$2"
      shift 2
      ;;
    --log-telemetry)
      LOG_TELEMETRY=true
      shift
      ;;
    --update-patterns)
      UPDATE_PATTERNS=true
      shift
      ;;
    --check-consensus)
      CHECK_CONSENSUS=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Run in background to avoid blocking Claude Code
(
  # Log telemetry
  if [ "$LOG_TELEMETRY" = true ] && [ -n "$FILE_PATH" ]; then
    node -e "
      const fs = require('fs');
      const path = require('path');

      try {
        const filePath = '$FILE_PATH';
        const stats = fs.statSync(filePath);

        const telemetry = {
          timestamp: new Date().toISOString(),
          file: filePath,
          size: stats.size,
          operation: 'edit',
          session: process.env.CLAUDE_SESSION_ID || 'unknown'
        };

        // Append to telemetry log
        const logFile = path.join(process.cwd(), '.claude', 'telemetry.jsonl');
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
        fs.appendFileSync(logFile, JSON.stringify(telemetry) + '\n');
      } catch (err) {
        // Silent fail
      }
    " 2>/dev/null
  fi

  # Update patterns
  if [ "$UPDATE_PATTERNS" = true ] && [ -n "$FILE_PATH" ]; then
    # Check if file was actually changed
    if [ -f ".claude/temp/$(basename "$FILE_PATH").pre-hash" ]; then
      OLD_HASH=$(cat ".claude/temp/$(basename "$FILE_PATH").pre-hash")
      NEW_HASH=$(md5sum "$FILE_PATH" 2>/dev/null | cut -d' ' -f1)

      if [ "$OLD_HASH" != "$NEW_HASH" ]; then
        # File changed - update patterns asynchronously
        node -e "
          const path = require('path');
          const filePath = '$FILE_PATH';

          try {
            // Queue pattern update
            const patternQueue = path.join(process.cwd(), '.claude', 'pattern-queue.jsonl');
            const fs = require('fs');
            fs.mkdirSync(path.dirname(patternQueue), { recursive: true });
            fs.appendFileSync(patternQueue, JSON.stringify({
              file: filePath,
              timestamp: new Date().toISOString(),
              action: 'update_patterns'
            }) + '\n');
          } catch (err) {
            // Silent fail
          }
        " 2>/dev/null
      fi

      # Clean up temp hash
      rm -f ".claude/temp/$(basename "$FILE_PATH").pre-hash"
    fi
  fi

  # Check consensus (lightweight check)
  if [ "$CHECK_CONSENSUS" = true ] && [ -n "$FILE_PATH" ]; then
    node -e "
      const path = require('path');
      const filePath = '$FILE_PATH';

      try {
        // Queue consensus check
        const consensusQueue = path.join(process.cwd(), '.claude', 'consensus-queue.jsonl');
        const fs = require('fs');
        fs.mkdirSync(path.dirname(consensusQueue), { recursive: true });
        fs.appendFileSync(consensusQueue, JSON.stringify({
          file: filePath,
          timestamp: new Date().toISOString(),
          action: 'check_consensus'
        }) + '\n');
      } catch (err) {
        // Silent fail
      }
    " 2>/dev/null
  fi
) &

exit 0
