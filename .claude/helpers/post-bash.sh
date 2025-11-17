#!/bin/bash

# IRIS Prime Post-Bash Hook
# Logs bash command results

COMMAND=""
EXIT_CODE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --command)
      COMMAND="$2"
      shift 2
      ;;
    --exit-code)
      EXIT_CODE="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Log command result in background
(
  node -e "
    const fs = require('fs');
    const path = require('path');

    try {
      const command = \`$COMMAND\`;
      const exitCode = '$EXIT_CODE';

      const logEntry = {
        timestamp: new Date().toISOString(),
        command: command,
        exitCode: parseInt(exitCode) || 0,
        success: exitCode === '0',
        type: 'post-bash'
      };

      const logFile = path.join(process.cwd(), '.claude', 'bash-history.jsonl');
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      // Silent fail
    }
  " 2>/dev/null
) &

exit 0
