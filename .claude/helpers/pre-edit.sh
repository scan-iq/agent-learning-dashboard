#!/bin/bash

# IRIS Prime Pre-Edit Hook
# Tracks file changes before edits occur

FILE_PATH=""
TRACK_CHANGES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --file)
      FILE_PATH="$2"
      shift 2
      ;;
    --track-changes)
      TRACK_CHANGES=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Exit silently if hooks disabled
[ "$IRIS_HOOKS_ENABLED" != "true" ] && exit 0

# Track file state if it exists
if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ] && [ "$TRACK_CHANGES" = true ]; then
  HASH=$(md5sum "$FILE_PATH" 2>/dev/null | cut -d' ' -f1)

  # Store in temp file for post-edit comparison
  mkdir -p .claude/temp
  echo "$HASH" > ".claude/temp/$(basename "$FILE_PATH").pre-hash"
fi

exit 0
