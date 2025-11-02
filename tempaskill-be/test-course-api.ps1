# Course API Test Script
# Tests all course endpoints after authentication

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   COURSE API ENDPOINT TESTS" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1"

# Test 1: Health Check
Write-Host "[1/10] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "  ✅ Health check successful" -ForegroundColor Green
    Write-Host "     Version: $($health.data.version)" -ForegroundColor White
} catch {
    Write-Host "  ❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Register Instructor
Write-Host "`n[2/10] Registering Instructor..." -ForegroundColor Yellow
$instructorData = @{
    name = "John Instructor"
    email = "instructor@test.com"
    password = "Password123!"
    role = "instructor"
} | ConvertTo-Json

try {
    $instructor = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $instructorData -ContentType "application/json"
    $instructorToken = $instructor.data.token
    $instructorId = $instructor.data.user.id
    Write-Host "  ✅ Instructor registered (ID: $instructorId)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Instructor may already exist, trying to login..." -ForegroundColor Yellow
    $loginData = @{
        email = "instructor@test.com"
        password = "Password123!"
    } | ConvertTo-Json
    
    $instructor = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $instructorToken = $instructor.data.token
    $instructorId = $instructor.data.user.id
    Write-Host "  ✅ Instructor logged in (ID: $instructorId)" -ForegroundColor Green
}

# Test 3: Register Student
Write-Host "`n[3/10] Registering Student..." -ForegroundColor Yellow
$studentData = @{
    name = "Jane Student"
    email = "student@test.com"
    password = "Password123!"
    role = "student"
} | ConvertTo-Json

try {
    $student = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $studentData -ContentType "application/json"
    $studentToken = $student.data.token
    $studentId = $student.data.user.id
    Write-Host "  ✅ Student registered (ID: $studentId)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Student may already exist, trying to login..." -ForegroundColor Yellow
    $loginData = @{
        email = "student@test.com"
        password = "Password123!"
    } | ConvertTo-Json
    
    $student = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $studentToken = $student.data.token
    $studentId = $student.data.user.id
    Write-Host "  ✅ Student logged in (ID: $studentId)" -ForegroundColor Green
}

# Test 4: Create Course (Instructor)
Write-Host "`n[4/10] Creating Course (as Instructor)..." -ForegroundColor Yellow
$courseData = @{
    title = "Go Programming Masterclass"
    description = "Learn Go from scratch to advanced"
    category = "programming"
    difficulty = "beginner"
    price = 99000
} | ConvertTo-Json

try {
    $course = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Body $courseData -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $instructorToken" }
    $courseId = $course.data.id
    Write-Host "  ✅ Course created (ID: $courseId, Slug: $($course.data.slug))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to create course: $($_.Exception.Message)" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "     Error: $($errorDetails.message)" -ForegroundColor Gray
}

# Test 5: List Courses (Public)
Write-Host "`n[5/10] Listing Courses (Public)..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$baseUrl/courses?page=1&limit=10" -Method GET
    Write-Host "  ✅ Found $($courses.data.courses.Count) courses" -ForegroundColor Green
    if ($courses.data.courses.Count -gt 0) {
        Write-Host "     First course: $($courses.data.courses[0].title)" -ForegroundColor White
    }
} catch {
    Write-Host "  ❌ Failed to list courses: $_" -ForegroundColor Red
}

# Test 6: Get Course Detail
Write-Host "`n[6/10] Getting Course Detail..." -ForegroundColor Yellow
try {
    $courseDetail = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method GET
    Write-Host "  ✅ Course detail retrieved" -ForegroundColor Green
    Write-Host "     Title: $($courseDetail.data.title)" -ForegroundColor White
    Write-Host "     Lessons: $($courseDetail.data.lesson_count)" -ForegroundColor White
} catch {
    Write-Host "  ❌ Failed to get course detail: $_" -ForegroundColor Red
}

# Test 7: Update Course (Publish)
Write-Host "`n[7/10] Publishing Course..." -ForegroundColor Yellow
$updateData = @{
    is_published = $true
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId" -Method PATCH -Body $updateData -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $instructorToken" }
    Write-Host "  ✅ Course published" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to publish course: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Create Lesson
Write-Host "`n[8/10] Creating Lesson..." -ForegroundColor Yellow
$lessonData = @{
    title = "Introduction to Go"
    content = "# Welcome to Go\n\nLet's learn Go programming!"
    order_index = 1
    duration = 600
} | ConvertTo-Json

try {
    $lesson = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method POST -Body $lessonData -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $instructorToken" }
    $lessonId = $lesson.data.id
    Write-Host "  ✅ Lesson created (ID: $lessonId)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to create lesson: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Enroll in Course (Student)
Write-Host "`n[9/10] Enrolling Student in Course..." -ForegroundColor Yellow
try {
    $enrollment = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" -Method POST -Headers @{ "Authorization" = "Bearer $studentToken" }
    Write-Host "  ✅ Successfully enrolled" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to enroll: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get Course Lessons (Student)
Write-Host "`n[10/10] Getting Course Lessons (as Student)..." -ForegroundColor Yellow
try {
    $lessons = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method GET -Headers @{ "Authorization" = "Bearer $studentToken" }
    Write-Host "  ✅ Retrieved $($lessons.data.Count) lessons" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to get lessons: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   COURSE API TESTS COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "   Instructor ID: $instructorId" -ForegroundColor White
Write-Host "   Student ID: $studentId" -ForegroundColor White
Write-Host "   Course ID: $courseId" -ForegroundColor White
if ($lessonId) {
    Write-Host "   Lesson ID: $lessonId" -ForegroundColor White
}
