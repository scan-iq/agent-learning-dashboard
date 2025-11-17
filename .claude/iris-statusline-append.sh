#!/bin/bash

# IRIS Prime Status Line Append
# Adds IRIS Prime metrics to Claude Flow status line

# Exit silently if not in IRIS Prime directory
[ ! -f "package.json" ] || ! grep -q "iris-prime-console" package.json 2>/dev/null && exit 0

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Get IRIS Prime metrics from cache
CACHE_FILE=".claude/metrics-cache.json"

if [ -f "$CACHE_FILE" ]; then
  # Check if cache is fresh (< 30 seconds old)
  if command -v node >/dev/null 2>&1; then
    IS_FRESH=$(node -e "
      const fs = require('fs');
      try {
        const cache = JSON.parse(fs.readFileSync('$CACHE_FILE', 'utf8'));
        const age = Date.now() - cache.timestamp;
        console.log(age < 30000 ? 'yes' : 'no');
      } catch (err) {
        console.log('no');
      }
    " 2>/dev/null)

    if [ "$IS_FRESH" = "yes" ]; then
      # Extract metrics using node
      METRICS=$(node -e "
        const fs = require('fs');
        try {
          const cache = JSON.parse(fs.readFileSync('$CACHE_FILE', 'utf8'));
          console.log(JSON.stringify(cache));
        } catch (err) {
          console.log('{}');
        }
      " 2>/dev/null)

      if [ -n "$METRICS" ] && [ "$METRICS" != "{}" ]; then
        # Parse individual metrics
        HEALTH=$(echo "$METRICS" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data.health||0)" 2>/dev/null || echo "0")
        CONSENSUS=$(echo "$METRICS" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data.consensus||0)" 2>/dev/null || echo "0")
        PATTERNS=$(echo "$METRICS" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data.patterns||0)" 2>/dev/null || echo "0")
        REFLEXIONS=$(echo "$METRICS" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data.reflexions||0)" 2>/dev/null || echo "0")
        ALERTS=$(echo "$METRICS" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data.alerts||0)" 2>/dev/null || echo "0")

        # Build IRIS section
        printf " │ \033[95m🤖 IRIS\033[0m"

        # Health score with color coding
        if [ "$HEALTH" -gt 0 ]; then
          if [ "$HEALTH" -ge 80 ]; then
            printf " \033[32m❤️ ${HEALTH}%%\033[0m"
          elif [ "$HEALTH" -ge 60 ]; then
            printf " \033[33m💛 ${HEALTH}%%\033[0m"
          else
            printf " \033[31m💔 ${HEALTH}%%\033[0m"
          fi
        fi

        # Consensus rate
        if [ "$CONSENSUS" -gt 0 ]; then
          if [ "$CONSENSUS" -ge 80 ]; then
            printf " \033[32m⚖️ ${CONSENSUS}%%\033[0m"
          else
            printf " \033[33m⚠️ ${CONSENSUS}%%\033[0m"
          fi
        fi

        # Patterns discovered
        if [ "$PATTERNS" -gt 0 ]; then
          printf " \033[36m🧠 ${PATTERNS}\033[0m"
        fi

        # Reflexions tracked
        if [ "$REFLEXIONS" -gt 0 ]; then
          printf " \033[35m💡 ${REFLEXIONS}\033[0m"
        fi

        # Active alerts
        if [ "$ALERTS" -gt 0 ]; then
          printf " \033[31m⚠️ ${ALERTS}\033[0m"
        fi
      fi
    fi
  fi
fi
