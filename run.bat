@echo off
setlocal


where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
    echo Installing pnpm...
    npm install -g pnpm
)

:: Check for node_modules directory or if force flag is set
if not exist "node_modules\" (
    echo Installing dependencies...
    pnpm install
) else (
    if "%~1"=="-f" (
        echo Installing dependencies...
        pnpm install
    )
)

:: Run the development script for Windows
pnpm run dev:windows

endlocal