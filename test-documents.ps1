# Test script for document access
Write-Host "Testing Document Access System" -ForegroundColor Green

# Step 1: Login as Admin to create documents
Write-Host "`nStep 1: Login as Admin (ADMIN001)" -ForegroundColor Yellow
$adminLogin = @{
    code = "ADMIN001"
    password = "Admin123!"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/Account/login" -Method POST -Body $adminLogin -ContentType "application/json"
$adminToken = $adminResponse.token

Write-Host "Admin login successful. Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Green

# Step 2: Create sample documents
Write-Host "`nStep 2: Creating sample documents" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$createResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/DocumentViewer/create-sample-documents" -Method POST -Headers $headers
Write-Host "Sample documents created: $($createResponse.message)" -ForegroundColor Green

# Step 3: Check documents as Admin
Write-Host "`nStep 3: Checking documents as Admin" -ForegroundColor Yellow
$adminDocuments = Invoke-RestMethod -Uri "https://localhost:5001/api/DocumentViewer" -Method GET -Headers $headers
Write-Host "Admin can see $($adminDocuments.Count) documents" -ForegroundColor Green

# Step 4: Login as Member
Write-Host "`nStep 4: Login as Member (MEMBER001)" -ForegroundColor Yellow
$memberLogin = @{
    code = "MEMBER001"
    password = "m5ojyr5t"
} | ConvertTo-Json

$memberResponse = Invoke-RestMethod -Uri "https://localhost:5001/api/Account/login" -Method POST -Body $memberLogin -ContentType "application/json"
$memberToken = $memberResponse.token

Write-Host "Member login successful. Token: $($memberToken.Substring(0, 20))..." -ForegroundColor Green

# Step 5: Check documents as Member
Write-Host "`nStep 5: Checking documents as Member" -ForegroundColor Yellow
$memberHeaders = @{
    "Authorization" = "Bearer $memberToken"
    "Content-Type" = "application/json"
}

$memberDocuments = Invoke-RestMethod -Uri "https://localhost:5001/api/DocumentViewer" -Method GET -Headers $memberHeaders
Write-Host "Member can see $($memberDocuments.Count) documents" -ForegroundColor Green

# Step 6: Show document details
Write-Host "`nStep 6: Document Details" -ForegroundColor Yellow
foreach ($doc in $memberDocuments) {
    Write-Host "Document: $($doc.fileName) - Description: $($doc.description)" -ForegroundColor Cyan
}

Write-Host "`nTest completed!" -ForegroundColor Green 