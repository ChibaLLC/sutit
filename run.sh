#!/usr/bin/env bash

force="false"
for arg in "$@"
do
    if [ "$arg" == "--force" ] || [ "$arg" == "-f" ]; then
        force="true"
    fi
done

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run the application."
    exit
fi

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
    exit
fi

if [ ! -d "node_modules" ] || [ "$force" == "true" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

pnpm run dev:linux