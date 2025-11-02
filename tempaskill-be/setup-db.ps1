# Database Setup Script for TempaSKill
# Run this script to create database and tables

Write-Host "🗄️  TempaSKill Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Read MySQL credentials
$mysqlHost = Read-Host "MySQL Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($mysqlHost)) { $mysqlHost = "localhost" }

$mysqlPort = Read-Host "MySQL Port (default: 3306)"
if ([string]::IsNullOrWhiteSpace($mysqlPort)) { $mysqlPort = "3306" }

$mysqlUser = Read-Host "MySQL User (default: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) { $mysqlUser = "root" }

$mysqlPassword = Read-Host "MySQL Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
$mysqlPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "📝 Creating database 'tempaskill'..." -ForegroundColor Yellow

# Try to find MySQL executable
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        break
    }
}

if ($null -eq $mysqlExe) {
    Write-Host "❌ MySQL executable not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL or add it to your PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual Setup Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open MySQL Workbench or command line client" -ForegroundColor White
    Write-Host "2. Run the SQL file: migrations/001_init_schema.sql" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Found MySQL at: $mysqlExe" -ForegroundColor Green

# Execute SQL file
$sqlFile = "migrations\001_init_schema.sql"
try {
    & $mysqlExe -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPass -e "source $sqlFile"
    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Database: tempaskill" -ForegroundColor Cyan
    Write-Host "📋 Tables created:" -ForegroundColor Cyan
    Write-Host "  - users" -ForegroundColor White
    Write-Host "  - courses" -ForegroundColor White
    Write-Host "  - lessons" -ForegroundColor White
    Write-Host "  - enrollments" -ForegroundColor White
    Write-Host "  - progresses" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 You can now run the server with: go run cmd/api/main.go" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Failed to setup database!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the SQL file manually using MySQL Workbench" -ForegroundColor Yellow
    exit 1
}
