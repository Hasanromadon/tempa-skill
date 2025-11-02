# Test User Management Endpoints
# Run this script after the server is running

$baseUrl = "http://localhost:8080/api/v1"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing User Management Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Login to get token
Write-Host "Test 1: Login" -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: Make sure user exists or register first" -ForegroundColor Yellow
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# Test 2: Get user profile by ID
Write-Host "`nTest 2: Get User Profile (Public)" -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/users/1" -Method GET -Headers $headers
    Write-Host "✓ Get user profile successful" -ForegroundColor Green
    Write-Host "User: $($userResponse.data.name) ($($userResponse.data.email))" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get user profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Update profile
Write-Host "`nTest 3: Update Profile" -ForegroundColor Yellow
$updateBody = @{
    name = "Updated Test User"
    bio = "This is my updated bio"
    avatar_url = "https://example.com/avatar.jpg"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method PATCH -Headers $authHeaders -Body $updateBody
    Write-Host "✓ Profile updated successfully" -ForegroundColor Green
    Write-Host "New name: $($updateResponse.data.name)" -ForegroundColor Gray
    Write-Host "New bio: $($updateResponse.data.bio)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Profile update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update profile with partial data
Write-Host "`nTest 4: Update Profile (Partial - Name Only)" -ForegroundColor Yellow
$partialUpdateBody = @{
    name = "Partially Updated Name"
} | ConvertTo-Json

try {
    $partialResponse = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method PATCH -Headers $authHeaders -Body $partialUpdateBody
    Write-Host "✓ Partial profile update successful" -ForegroundColor Green
    Write-Host "Updated name: $($partialResponse.data.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Partial profile update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Change password (success)
Write-Host "`nTest 5: Change Password (Correct Current Password)" -ForegroundColor Yellow
$changePasswordBody = @{
    current_password = "password123"
    new_password = "newPassword456"
} | ConvertTo-Json

try {
    $passwordResponse = Invoke-RestMethod -Uri "$baseUrl/users/me/password" -Method PATCH -Headers $authHeaders -Body $changePasswordBody
    Write-Host "✓ Password changed successfully" -ForegroundColor Green
    Write-Host "Message: $($passwordResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Password change failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Login with new password
Write-Host "`nTest 6: Login with New Password" -ForegroundColor Yellow
$newLoginBody = @{
    email = "test@example.com"
    password = "newPassword456"
} | ConvertTo-Json

try {
    $newLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $newLoginBody
    Write-Host "✓ Login with new password successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login with new password failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Change password back to original
Write-Host "`nTest 7: Change Password Back to Original" -ForegroundColor Yellow
$newToken = $newLoginResponse.data.token
$newAuthHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $newToken"
}

$resetPasswordBody = @{
    current_password = "newPassword456"
    new_password = "password123"
} | ConvertTo-Json

try {
    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/users/me/password" -Method PATCH -Headers $newAuthHeaders -Body $resetPasswordBody
    Write-Host "✓ Password reset to original successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Try to change password with wrong current password
Write-Host "`nTest 8: Change Password (Wrong Current Password - Should Fail)" -ForegroundColor Yellow
$wrongPasswordBody = @{
    current_password = "wrongPassword"
    new_password = "newPassword789"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/users/me/password" -Method PATCH -Headers $authHeaders -Body $wrongPasswordBody
    Write-Host "✗ Should have failed but succeeded!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected wrong password" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 9: Try to access protected route without token
Write-Host "`nTest 9: Access Protected Route Without Token (Should Fail)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/users/me" -Method PATCH -Headers $headers -Body $updateBody
    Write-Host "✗ Should have failed but succeeded!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected request without token" -ForegroundColor Green
}

# Test 10: Get non-existent user
Write-Host "`nTest 10: Get Non-existent User (Should Fail)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/users/9999" -Method GET -Headers $headers
    Write-Host "✗ Should have failed but succeeded!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly returned 404 for non-existent user" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All User Management Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
