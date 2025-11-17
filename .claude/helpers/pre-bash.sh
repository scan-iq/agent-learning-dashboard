#!/bin/bash

# IRIS Prime Pre-Bash Hook
# Validates and prepares bash commands

COMMAND=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --command)
      COMMAND="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Log command execution
if [ -n "$COMMAND" ]; then
  node -e "
    const fs = require('fs');
    const path = require('path');

    try {
      const command = \`$COMMAND\`;
      const logEntry = {
        timestamp: new Date().toISOString(),
        command: command,
        type: 'pre-bash'
      };

      const logFile = path.join(process.cwd(), '.claude', 'bash-history.jsonl');
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      // Silent fail
    }
  " 2>/dev/null
fi

exit 0
