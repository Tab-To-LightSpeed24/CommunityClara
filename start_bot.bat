# Quick Start Script for Windows
# Save this as: start_bot.bat

@echo off
echo ============================================
echo   Starting CommunityClara Discord Bot
echo ============================================
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting bot with FastAPI backend...
echo.
echo Bot will be online in Discord once you see:
echo   "🤖 CommunityClara#XXXX is now online!"
echo.
echo Press Ctrl+C to stop the bot
echo ============================================
echo.

python -m app.main_with_bot

pause
