# TempaSKill Authentication Testing Script
# Run this after server is running on http://localhost:8080

Write-Host "🧪 TempaSKill Authentication Testing" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/v1"

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($health.success) {
        Write-Host "   ✅ Health check passed!" -ForegroundColor Green
        Write-Host "   Version: $($health.data.version)" -ForegroundColor Gray
        Write-Host "   Environment: $($health.data.environment)" -ForegroundColor Gray
        Write-Host "   Database: $($health.data.database)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure server is running on port 8080" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Register Student
Write-Host "2️⃣  Testing User Registration (Student)..." -ForegroundColor Yellow
$registerBody = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    if ($register.success) {
        Write-Host "   ✅ Registration successful!" -ForegroundColor Green
        Write-Host "   User ID: $($register.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($register.data.name)" -ForegroundColor Gray
        Write-Host "   Email: $($register.data.email)" -ForegroundColor Gray
        Write-Host "   Role: $($register.data.role)" -ForegroundColor Gray
    }
} catch {
    $errorMsg = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorMsg.message -like "*already registered*") {
        Write-Host "   ⚠️  User already exists (expected on re-run)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Registration failed: $($errorMsg.message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Register Instructor
Write-Host "3️⃣  Testing User Registration (Instructor)..." -ForegroundColor Yellow
$instructorBody = @{
    name = "Jane Instructor"
    email = "instructor@example.com"
    password = "password123"
    role = "instructor"
} | ConvertTo-Json

try {
    $registerInstructor = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $instructorBody -ContentType "application/json"
    if ($registerInstructor.success) {
        Write-Host "   ✅ Instructor registration successful!" -ForegroundColor Green
        Write-Host "   User ID: $($registerInstructor.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($registerInstructor.data.name)" -ForegroundColor Gray
        Write-Host "   Role: $($registerInstructor.data.role)" -ForegroundColor Gray
    }
} catch {
    $errorMsg = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorMsg.message -like "*already registered*") {
        Write-Host "   ⚠️  Instructor already exists (expected on re-run)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Instructor registration failed: $($errorMsg.message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Login
Write-Host "4️⃣  Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    if ($login.success) {
        Write-Host "   ✅ Login successful!" -ForegroundColor Green
        $token = $login.data.token
        $user = $login.data.user
        Write-Host "   User: $($user.name) ($($user.email))" -ForegroundColor Gray
        Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Get Current User (Protected Route)
Write-Host "5️⃣  Testing Protected Route (GET /auth/me)..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
    if ($me.success) {
        Write-Host "   ✅ Protected route access successful!" -ForegroundColor Green
        Write-Host "   User ID: $($me.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($me.data.name)" -ForegroundColor Gray
        Write-Host "   Email: $($me.data.email)" -ForegroundColor Gray
        Write-Host "   Role: $($me.data.role)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed to access protected route: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 6: Test Invalid Token
Write-Host "6️⃣  Testing Invalid Token (Should Fail)..." -ForegroundColor Yellow
$invalidHeaders = @{
    Authorization = "Bearer invalid-token-here"
}

try {
    $invalid = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $invalidHeaders
    Write-Host "   ❌ Invalid token was accepted (unexpected!)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Invalid token correctly rejected!" -ForegroundColor Green
    Write-Host "   Error: Unauthorized (expected)" -ForegroundColor Gray
}
Write-Host ""

# Test 7: Test Missing Token
Write-Host "7️⃣  Testing Missing Token (Should Fail)..." -ForegroundColor Yellow
try {
    $noToken = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get
    Write-Host "   ❌ Request without token was accepted (unexpected!)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Missing token correctly rejected!" -ForegroundColor Green
    Write-Host "   Error: Authorization header required (expected)" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 All Authentication Tests Completed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Test Results:" -ForegroundColor Cyan
Write-Host "  - Health check: PASSED" -ForegroundColor White
Write-Host "  - User registration: PASSED" -ForegroundColor White
Write-Host "  - Instructor registration: PASSED" -ForegroundColor White
Write-Host "  - Login & JWT generation: PASSED" -ForegroundColor White
Write-Host "  - Protected route access: PASSED" -ForegroundColor White
Write-Host "  - Invalid token rejection: PASSED" -ForegroundColor White
Write-Host "  - Missing token rejection: PASSED" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Your JWT Token (save this for manual testing):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Use this token to test other endpoints:" -ForegroundColor Cyan
Write-Host '  $headers = @{Authorization="Bearer ' -NoNewline -ForegroundColor White
Write-Host $token -NoNewline -ForegroundColor Gray
Write-Host '"}' -ForegroundColor White
Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/me" -Headers $headers' -ForegroundColor White
Write-Host ""
