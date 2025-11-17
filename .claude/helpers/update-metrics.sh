#!/bin/bash

# IRIS Prime Metrics Updater
# Background process to update metrics cache

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

node -e "
  const fs = require('fs');
  const path = require('path');

  try {
    // Gather metrics from various sources
    const baseDir = process.cwd();
    const claudeDir = path.join(baseDir, '.claude');

    // Read telemetry
    let telemetryCount = 0;
    const telemetryFile = path.join(claudeDir, 'telemetry.jsonl');
    if (fs.existsSync(telemetryFile)) {
      const content = fs.readFileSync(telemetryFile, 'utf8').trim();
      telemetryCount = content ? content.split('\n').length : 0;
    }

    // Read reflexions
    let reflexionCount = 0;
    const reflexionFile = path.join(claudeDir, 'reflexions.jsonl');
    if (fs.existsSync(reflexionFile)) {
      const content = fs.readFileSync(reflexionFile, 'utf8').trim();
      reflexionCount = content ? content.split('\n').length : 0;
    }

    // Read pattern queue
    let patternCount = 0;
    const patternQueueFile = path.join(claudeDir, 'pattern-queue.jsonl');
    if (fs.existsSync(patternQueueFile)) {
      const content = fs.readFileSync(patternQueueFile, 'utf8').trim();
      patternCount = content ? content.split('\n').length : 0;
    }

    // Read alerts
    let alertCount = 0;
    const alertFile = path.join(claudeDir, 'alerts.json');
    if (fs.existsSync(alertFile)) {
      const alerts = JSON.parse(fs.readFileSync(alertFile, 'utf8'));
      alertCount = (alerts.active || []).length;
    }

    // Calculate health score (mock algorithm)
    const health = Math.min(100, 70 + reflexionCount * 2);

    // Calculate consensus rate (mock algorithm)
    const consensus = Math.min(100, 60 + patternCount * 3);

    // Create metrics object
    const metrics = {
      timestamp: Date.now(),
      health: Math.round(health),
      consensus: Math.round(consensus),
      patterns: patternCount,
      reflexions: reflexionCount,
      notifications: telemetryCount,
      alerts: alertCount
    };

    // Write to cache
    const cacheFile = path.join(claudeDir, 'metrics-cache.json');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(metrics, null, 2));

    console.log('Metrics updated:', JSON.stringify(metrics));
  } catch (err) {
    console.error('Failed to update metrics:', err.message);
    process.exit(1);
  }
" 2>/dev/null

exit 0
