# TempaSKill - Start Full Development Environment
# Menjalankan Backend (port 8080) dan Frontend (port 3000) secara bersamaan

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TempaSKill - Full Development Environment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting both Backend and Frontend servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Swagger:  http://localhost:8080/swagger/index.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "Stopping all servers..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "All servers stopped." -ForegroundColor Green
}

# Register cleanup on Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

try {
    # Start Backend in background job
    Write-Host "[Backend] Starting..." -ForegroundColor Cyan
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location tempaskill-be
        go run cmd/api/main.go
    }

    # Wait a bit for backend to start
    Start-Sleep -Seconds 2

    # Start Frontend in background job
    Write-Host "[Frontend] Starting..." -ForegroundColor Cyan
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location tempaskill-fe
        yarn run dev
    }

    Write-Host ""
    Write-Host "Both servers are starting up..." -ForegroundColor Green
    Write-Host "Wait a few seconds for them to be ready." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Logs:" -ForegroundColor Cyan
    Write-Host "------" -ForegroundColor Gray

    # Monitor both jobs and display output
    while ($true) {
        # Get backend output
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            $backendOutput | ForEach-Object {
                Write-Host "[Backend] $_" -ForegroundColor Blue
            }
        }

        # Get frontend output
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                Write-Host "[Frontend] $_" -ForegroundColor Magenta
            }
        }

        # Check if jobs are still running
        if ($backendJob.State -ne 'Running' -and $frontendJob.State -ne 'Running') {
            Write-Host ""
            Write-Host "Both servers have stopped." -ForegroundColor Yellow
            break
        }

        Start-Sleep -Milliseconds 500
    }
}
catch {
    Write-Host ""
    Write-Host "Error occurred: $_" -ForegroundColor Red
}
finally {
    Cleanup
}
