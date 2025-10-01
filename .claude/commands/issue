#!/bin/bash

# GitHub Issue Processor - Custom /issue command
# This script runs the issue.md command with Claude Code

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMAND_FILE="$SCRIPT_DIR/issue.md"

# Check if the issue.md command file exists
if [[ ! -f "$COMMAND_FILE" ]]; then
    echo "Error: issue.md command file not found at $COMMAND_FILE"
    exit 1
fi

# Check if claude-code is available
if ! command -v claude-code &> /dev/null; then
    echo "Error: claude-code is not installed or not in PATH"
    exit 1
fi

# Run the issue.md command with Claude Code, passing all arguments
exec claude-code "/issue $*"