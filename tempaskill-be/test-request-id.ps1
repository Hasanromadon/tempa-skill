# Test Request ID Propagation
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REQUEST ID PROPAGATION TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Auto-generated Request ID
Write-Host "Test 1: Auto-generated Request ID" -ForegroundColor Yellow
Write-Host "Making request without X-Request-ID header..." -ForegroundColor Gray

$response1 = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -Method GET -UseBasicParsing
$body1 = $response1.Content | ConvertFrom-Json
$headerID1 = $response1.Headers['X-Request-ID']

Write-Host "  Response Body request_id: $($body1.request_id)" -ForegroundColor White
Write-Host "  Response Header X-Request-ID: $headerID1" -ForegroundColor White

if ($body1.request_id -and $headerID1 -and $body1.request_id -eq $headerID1) {
    Write-Host "  ✅ PASS: Request ID auto-generated and matches in body and header`n" -ForegroundColor Green
    $test1 = $true
} else {
    Write-Host "  ❌ FAIL: Request ID mismatch or missing`n" -ForegroundColor Red
    $test1 = $false
}

# Test 2: Client-provided Request ID
Write-Host "Test 2: Client-provided Request ID" -ForegroundColor Yellow
$clientRequestID = "test-request-12345"
Write-Host "Sending custom X-Request-ID: $clientRequestID" -ForegroundColor Gray

$headers = @{ "X-Request-ID" = $clientRequestID }
$response2 = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -Method GET -Headers $headers -UseBasicParsing
$body2 = $response2.Content | ConvertFrom-Json
$headerID2 = $response2.Headers['X-Request-ID']

Write-Host "  Response Body request_id: $($body2.request_id)" -ForegroundColor White
Write-Host "  Response Header X-Request-ID: $headerID2" -ForegroundColor White

if ($body2.request_id -eq $clientRequestID -and $headerID2 -eq $clientRequestID) {
    Write-Host "  ✅ PASS: Client request ID preserved in body and header`n" -ForegroundColor Green
    $test2 = $true
} else {
    Write-Host "  ❌ FAIL: Client request ID not preserved`n" -ForegroundColor Red
    $test2 = $false
}

# Test 3: Request ID in Error Response
Write-Host "Test 3: Request ID in Error Response" -ForegroundColor Yellow
Write-Host "Making request to non-existent endpoint..." -ForegroundColor Gray

try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/nonexistent" -Method GET -UseBasicParsing
} catch {
    $response3 = $_.Exception.Response
    $stream = $response3.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body3Text = $reader.ReadToEnd()
    $body3 = $body3Text | ConvertFrom-Json
    $headerID3 = $response3.Headers['X-Request-ID']
}

Write-Host "  Response Body request_id: $($body3.request_id)" -ForegroundColor White  
Write-Host "  Response Header X-Request-ID: $headerID3" -ForegroundColor White

if ($body3.request_id -and $headerID3) {
    Write-Host "  ✅ PASS: Request ID included in error responses`n" -ForegroundColor Green
    $test3 = $true
} else {
    Write-Host "  ❌ FAIL: Request ID missing from error response`n" -ForegroundColor Red
    $test3 = $false
}

# Test 4: Unique Request IDs
Write-Host "Test 4: Request ID Uniqueness" -ForegroundColor Yellow
Write-Host "Making multiple requests to verify unique IDs..." -ForegroundColor Gray

$ids = @()
for ($i = 1; $i -le 5; $i++) {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -Method GET -UseBasicParsing
    $b = $r.Content | ConvertFrom-Json
    $ids += $b.request_id
}

$uniqueIDs = $ids | Select-Object -Unique
Write-Host "  Generated $($ids.Count) requests, $($uniqueIDs.Count) unique IDs" -ForegroundColor White

if ($uniqueIDs.Count -eq $ids.Count) {
    Write-Host "  ✅ PASS: All request IDs are unique`n" -ForegroundColor Green
    $test4 = $true
} else {
    Write-Host "  ❌ FAIL: Duplicate request IDs detected`n" -ForegroundColor Red
    $test4 = $false
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = 0
$total = 4

if ($test1) { $passed++ }
if ($test2) { $passed++ }
if ($test3) { $passed++ }
if ($test4) { $passed++ }

Write-Host "Tests Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "`n🎉 All Request ID tests passed!" -ForegroundColor Green
    Write-Host "Request ID tracking is fully functional.`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some tests failed. Check the output above.`n" -ForegroundColor Yellow
    exit 1
}
