# TempaSKill - Start Backend Server
# Menjalankan Go backend server di port 8080

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TempaSKill - Backend Server" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "tempaskill-be")) {
    Write-Host "Error: tempaskill-be folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location tempaskill-be

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server will run at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "API Documentation: http://localhost:8080/swagger/index.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Run the backend
go run cmd/api/main.go
