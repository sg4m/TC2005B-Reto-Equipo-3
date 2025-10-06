#!/usr/bin/env pwsh
# Start both frontend and backend development servers

Write-Host "Starting Banorte Business Rules Development Servers..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor White
Write-Host ""

# Start both processes
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev:frontend" -PassThru -NoNewWindow
$backend = Start-Process -FilePath "npm" -ArgumentList "run", "dev:backend" -PassThru -NoNewWindow

# Wait for Ctrl+C
try {
    Write-Host "Both servers are starting..."
    Write-Host "Use 'npm run dev' for colored output with concurrently"
    
    # Keep the script running
    while ($true) {
        Start-Sleep 1
        
        # Check if processes are still running
        if ($frontend.HasExited -and $backend.HasExited) {
            break
        }
    }
} finally {
    # Clean up processes on exit
    Write-Host "`nShutting down servers..." -ForegroundColor Red
    if (!$frontend.HasExited) { Stop-Process -Id $frontend.Id -Force }
    if (!$backend.HasExited) { Stop-Process -Id $backend.Id -Force }
    Write-Host "Servers stopped." -ForegroundColor Red
}