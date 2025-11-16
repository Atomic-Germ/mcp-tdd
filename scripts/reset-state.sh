#!/bin/bash
# Reset TDD state - useful when server gets into a bad state

STATE_DIR="${TDD_STATE_DIR:-/tmp/mcp-tdd-state}"

echo "Resetting TDD state in: $STATE_DIR"

if [ -d "$STATE_DIR" ]; then
  rm -rf "$STATE_DIR"
  echo "✅ State cleared"
else
  echo "ℹ️  No state directory found"
fi

mkdir -p "$STATE_DIR"
echo "✅ Fresh state directory created"
echo ""
echo "Server is ready for a clean start."
