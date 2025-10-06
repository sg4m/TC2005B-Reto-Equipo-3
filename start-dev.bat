@echo off
echo Starting Banorte Business Rules Development Servers...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo Press Ctrl+C to stop both servers
echo.

echo Starting both servers...
start /b "Frontend" npm run dev:frontend
start /b "Backend" npm run dev:backend

echo Both servers are starting...
echo Use 'npm run dev' for better output formatting
echo.
pause