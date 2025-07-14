#!/bin/bash

# Set up environment variables for Linux development
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/tmp}
export DISPLAY=${DISPLAY:-:0}

# Make sure we have the required directories
mkdir -p /tmp/runtime-$(whoami)
chmod 700 /tmp/runtime-$(whoami)

# Run the development server
npm run dev