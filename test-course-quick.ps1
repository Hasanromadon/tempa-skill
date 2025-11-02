Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   COURSE API TEST SUITE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1"
$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    if ($response.data.database -eq "connected") {
        Write-Host "   ✅ PASSED - Server is healthy" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected response" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2: List Courses (Empty)
Write-Host "`nTest 2: List Courses..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET
    Write-Host "   ✅ PASSED - Got courses list" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Create Course (Unauthorized)
Write-Host "`nTest 3: Create Course (Unauthorized)..." -ForegroundColor Yellow
try {
    $body = @{
        title = "Test Course"
        category = "programming"
        difficulty = "beginner"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   ❌ FAILED - Should have returned 401" -ForegroundColor Red
    $testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✅ PASSED - Correctly returned 401 Unauthorized" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED - Wrong status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 4: Register Instructor
Write-Host "`nTest 4: Register Instructor..." -ForegroundColor Yellow
try {
    $instructorEmail = "instructor-$([guid]::NewGuid().ToString().Substring(0,8))@test.com"
    $instructorPassword = "Password123!"
    
    $body = @{
        name = "Test Instructor"
        email = $instructorEmail
        password = $instructorPassword
        role = "instructor"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $body -ContentType "application/json"
    
    # Now login to get token
    $loginBody = @{
        email = $instructorEmail
        password = $instructorPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $instructorToken = $loginResponse.data.token
    
    Write-Host "   ✅ PASSED - Instructor registered and logged in" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Create Course (Authorized)
Write-Host "`nTest 5: Create Course (Authorized)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $instructorToken"
    }
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $body = @{
        title = "Go Programming Course $timestamp"
        description = "Learn Go from scratch"
        category = "programming"
        difficulty = "beginner"
        price = 99000
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    $courseId = $response.data.id
    Write-Host "   ✅ PASSED - Course created with ID: $courseId" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
    $courseId = 1  # Fallback to existing course for remaining tests
}

# Test 6: Get Course by ID
Write-Host "`nTest 6: Get Course by ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method GET
    if ($response.data.id -eq $courseId) {
        Write-Host "   ✅ PASSED - Retrieved course correctly" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED - Wrong course data" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 7: Update Course
Write-Host "`nTest 7: Update Course..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $instructorToken"
    }
    $body = @{
        is_published = $true
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
    if ($response.data.is_published -eq $true) {
        Write-Host "   ✅ PASSED - Course published successfully" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ FAILED - Course not published" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 8: Register Student
Write-Host "`nTest 8: Register Student..." -ForegroundColor Yellow
try {
    $studentEmail = "student-$([guid]::NewGuid().ToString().Substring(0,8))@test.com"
    $studentPassword = "Password123!"
    
    $body = @{
        name = "Test Student"
        email = $studentEmail
        password = $studentPassword
        role = "student"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $body -ContentType "application/json"
    
    # Now login to get token
    $loginBody = @{
        email = $studentEmail
        password = $studentPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $studentToken = $loginResponse.data.token
    
    Write-Host "   ✅ PASSED - Student registered and logged in" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 9: Enroll in Course
Write-Host "`nTest 9: Enroll in Course..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST -Headers $headers
    Write-Host "   ✅ PASSED - Successfully enrolled" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 10: Create Lesson
Write-Host "`nTest 10: Create Lesson..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $instructorToken"
    }
    $body = @{
        title = "Introduction to Go"
        content = "# Welcome to Go Programming"
        order_index = 1
        duration = 600
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "   ✅ PASSED - Lesson created" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "   Passed: $testsPassed" -ForegroundColor Green
Write-Host "   Failed: $testsFailed" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
}
