#!/bin/bash

# IRIS Prime Session Start Hook
# Loads context and checks for alerts

LOAD_CONTEXT=false
CHECK_ALERTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --load-context)
      LOAD_CONTEXT=true
      shift
      ;;
    --check-alerts)
      CHECK_ALERTS=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Run in background
(
  # Load context
  if [ "$LOAD_CONTEXT" = true ]; then
    node -e "
      const fs = require('fs');
      const path = require('path');

      try {
        const sessionFile = path.join(process.cwd(), '.claude', 'session.json');

        const session = {
          id: process.env.CLAUDE_SESSION_ID || Date.now().toString(),
          startTime: new Date().toISOString(),
          context: {
            cwd: process.cwd(),
            user: process.env.USER || 'unknown'
          }
        };

        fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
        fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
      } catch (err) {
        // Silent fail
      }
    " 2>/dev/null
  fi

  # Check for alerts
  if [ "$CHECK_ALERTS" = true ]; then
    node -e "
      const fs = require('fs');
      const path = require('path');

      try {
        const alertFile = path.join(process.cwd(), '.claude', 'alerts.json');

        if (fs.existsSync(alertFile)) {
          const alerts = JSON.parse(fs.readFileSync(alertFile, 'utf8'));

          if (alerts.active && alerts.active.length > 0) {
            console.log('⚠️  IRIS Prime Alerts:');
            alerts.active.forEach(alert => {
              console.log(\`   - \${alert.message}\`);
            });
          }
        }
      } catch (err) {
        // Silent fail
      }
    " 2>/dev/null
  fi
) &

exit 0
