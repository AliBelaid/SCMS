# Apply Database Migration for Visitor Management Enhancements
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Visitor Management Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to API directory
Set-Location -Path ".\API"

Write-Host "Step 1: Checking Entity Framework tools..." -ForegroundColor Yellow
dotnet ef --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Entity Framework tools not found. Installing..." -ForegroundColor Red
    dotnet tool install --global dotnet-ef
}

Write-Host ""
Write-Host "Step 2: Creating migration..." -ForegroundColor Yellow
dotnet ef migrations add AddVisitorManagementEnhancements --context AppIdentityDbContext

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create migration" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Write-Host ""
Write-Host "Step 3: Applying migration to database..." -ForegroundColor Yellow
dotnet ef database update --context AppIdentityDbContext

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to apply migration" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Write-Host ""
Write-Host "Step 4: Verifying migration..." -ForegroundColor Yellow
dotnet ef migrations list --context AppIdentityDbContext

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "New fields added:" -ForegroundColor White
Write-Host "  Visits table:" -ForegroundColor Yellow
Write-Host "    - RejectionReason" -ForegroundColor Gray
Write-Host "    - RejectedAt" -ForegroundColor Gray
Write-Host "    - RejectedByUserId" -ForegroundColor Gray
Write-Host ""
Write-Host "  Visitors table:" -ForegroundColor Yellow
Write-Host "    - BlockReason" -ForegroundColor Gray
Write-Host "    - BlockedAt" -ForegroundColor Gray
Write-Host "    - BlockedByUserId" -ForegroundColor Gray
Write-Host "    - CreatedByUserId" -ForegroundColor Gray
Write-Host ""
Write-Host "Status values updated:" -ForegroundColor White
Write-Host "  - 'ongoing' → 'checkedin'" -ForegroundColor Gray
Write-Host "  - 'completed' → 'checkedout'" -ForegroundColor Gray
Write-Host "  - 'incomplete' → 'rejected'" -ForegroundColor Gray
Write-Host ""

# Return to root directory
Set-Location -Path ".."

Write-Host "You can now restart your API server." -ForegroundColor Cyan
Write-Host ""

