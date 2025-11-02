# Progress Tracking API Test Script
# Tests all progress tracking endpoints

$baseUrl = "http://localhost:8080/api/v1"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PROGRESS TRACKING TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

# Test 1: Register instructor and create course with lessons
Write-Host "Test 1: Setup - Register instructor & create course..." -ForegroundColor Yellow
try {
    $registerResp = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body (@{
        name = "Instructor Progress $timestamp"
        email = "instructor.progress.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
        email = "instructor.progress.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $instructorToken = $loginResp.data.token
    
    # Create course
    $courseResp = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST `
        -Headers @{Authorization="Bearer $instructorToken"} `
        -Body (@{
            title = "Progress Test Course $timestamp"
            slug = "progress-test-$timestamp"
            description = "Course for testing progress"
            category = "programming"
            difficulty = "beginner"
        } | ConvertTo-Json) -ContentType "application/json"
    
    $courseId = $courseResp.data.id
    
    # Publish the course
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method PATCH `
        -Headers @{Authorization="Bearer $instructorToken"} `
        -Body (@{
            is_published = $true
        } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    
    # Create 3 lessons
    $lesson1 = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method POST `
        -Headers @{Authorization="Bearer $instructorToken"} `
        -Body (@{
            title = "Lesson 1"
            content = "# Lesson 1 Content`n`nThis is the first lesson."
            order_index = 1
            duration = 10
        } | ConvertTo-Json) -ContentType "application/json"
    
    $lesson1Id = $lesson1.data.id
    
    $lesson2 = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method POST `
        -Headers @{Authorization="Bearer $instructorToken"} `
        -Body (@{
            title = "Lesson 2"
            content = "# Lesson 2 Content`n`nThis is the second lesson."
            order_index = 2
            duration = 15
        } | ConvertTo-Json) -ContentType "application/json"
    
    $lesson2Id = $lesson2.data.id
    
    $lesson3 = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method POST `
        -Headers @{Authorization="Bearer $instructorToken"} `
        -Body (@{
            title = "Lesson 3"
            content = "# Lesson 3 Content`n`nThis is the third lesson."
            order_index = 3
            duration = 20
        } | ConvertTo-Json) -ContentType "application/json"
    
    $lesson3Id = $lesson3.data.id
    
    Write-Host "   ✅ PASSED - Course created with ID: $courseId, 3 lessons created" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    $failed++
    exit 1
}

# Test 2: Register student and enroll in course
Write-Host "`nTest 2: Register student & enroll..." -ForegroundColor Yellow
try {
    $studentReg = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body (@{
        name = "Student Progress $timestamp"
        email = "student.progress.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $studentLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
        email = "student.progress.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $studentToken = $studentLogin.data.token
    
    # Enroll in course
    Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST `
        -Headers @{Authorization="Bearer $studentToken"} | Out-Null
    
    Write-Host "   ✅ PASSED - Student enrolled successfully" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    $failed++
}

# Test 3: Mark first lesson as complete
Write-Host "`nTest 3: Mark lesson 1 as complete..." -ForegroundColor Yellow
try {
    $completeResp = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson1Id/complete" -Method POST `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($completeResp.success -and $completeResp.data.completed_lessons -eq 1) {
        Write-Host "   ✅ PASSED - Lesson marked complete, progress: $($completeResp.data.percentage)%" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Mark second lesson as complete
Write-Host "`nTest 4: Mark lesson 2 as complete..." -ForegroundColor Yellow
try {
    $completeResp = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson2Id/complete" -Method POST `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($completeResp.success -and $completeResp.data.completed_lessons -eq 2) {
        $percentage = [math]::Round($completeResp.data.percentage, 2)
        Write-Host "   ✅ PASSED - 2 lessons complete, progress: $percentage%" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Expected 2 completed lessons" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Get course progress
Write-Host "`nTest 5: Get course progress..." -ForegroundColor Yellow
try {
    $progressResp = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/progress" -Method GET `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($progressResp.success -and `
        $progressResp.data.completed_lessons -eq 2 -and `
        $progressResp.data.total_lessons -eq 3 -and `
        $progressResp.data.lessons.Count -eq 3) {
        Write-Host "   ✅ PASSED - Progress: 2/3 lessons, $($progressResp.data.percentage)%" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected progress data" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Mark same lesson complete again (idempotent)
Write-Host "`nTest 6: Mark lesson 1 complete again (idempotent)..." -ForegroundColor Yellow
try {
    $completeResp = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson1Id/complete" -Method POST `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($completeResp.success -and $completeResp.data.completed_lessons -eq 2) {
        Write-Host "   ✅ PASSED - Idempotent operation successful" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Should still be 2 completed lessons" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Complete all lessons (100%)
Write-Host "`nTest 7: Complete remaining lesson (100%)..." -ForegroundColor Yellow
try {
    $completeResp = Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson3Id/complete" -Method POST `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($completeResp.success -and `
        $completeResp.data.completed_lessons -eq 3 -and `
        $completeResp.data.percentage -eq 100) {
        Write-Host "   ✅ PASSED - Course 100% complete!" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Expected 100% completion" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Get user progress summary
Write-Host "`nTest 8: Get user progress summary..." -ForegroundColor Yellow
try {
    $userProgressResp = Invoke-RestMethod -Uri "$baseUrl/users/me/progress" -Method GET `
        -Headers @{Authorization="Bearer $studentToken"}
    
    if ($userProgressResp.success -and `
        $userProgressResp.data.total_enrolled -eq 1 -and `
        $userProgressResp.data.total_completed -eq 1 -and `
        $userProgressResp.data.courses.Count -eq 1 -and `
        $userProgressResp.data.courses[0].status -eq "completed") {
        Write-Host "   ✅ PASSED - User progress: 1 enrolled, 1 completed" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ FAILED - Unexpected user progress data" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 9: Try to complete lesson without enrollment
Write-Host "`nTest 9: Try to complete lesson without enrollment (should fail)..." -ForegroundColor Yellow
try {
    $anotherStudent = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body (@{
        name = "Unenrolled Student $timestamp"
        email = "unenrolled.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $unenrolledLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
        email = "unenrolled.$timestamp@test.com"
        password = "password123"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $unenrolledToken = $unenrolledLogin.data.token
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/lessons/$lesson1Id/complete" -Method POST `
            -Headers @{Authorization="Bearer $unenrolledToken"}
        Write-Host "   ❌ FAILED - Should have been forbidden" -ForegroundColor Red
        $failed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "   ✅ PASSED - Correctly returned 403 Forbidden" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "   ❌ FAILED - Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            $failed++
        }
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 10: Try to access progress without authentication
Write-Host "`nTest 10: Try to access progress without auth (should fail)..." -ForegroundColor Yellow
try {
    try {
        Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/progress" -Method GET
        Write-Host "   ❌ FAILED - Should have been unauthorized" -ForegroundColor Red
        $failed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✅ PASSED - Correctly returned 401 Unauthorized" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "   ❌ FAILED - Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            $failed++
        }
    }
} catch {
    Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "   Passed: $passed" -ForegroundColor Green
Write-Host "   Failed: $failed" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    exit 1
}
