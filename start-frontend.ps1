# TempaSKill - Start Frontend Development Server
# Menjalankan Next.js frontend di port 3000

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TempaSKill - Frontend Development Server" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "tempaskill-fe")) {
    Write-Host "Error: tempaskill-fe folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Navigate to frontend directory
Set-Location tempaskill-fe

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    yarn install
    Write-Host ""
}

Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "Server will run at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Run the frontend
yarn run dev
