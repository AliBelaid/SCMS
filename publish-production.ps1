#!/usr/bin/env pwsh

# Stop on first error
$ErrorActionPreference = "Stop"

# Get the script directory (root of the solution)
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SCMS Production Publish Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Angular in Production Mode
Write-Host "📦 Step 1: Building Angular Application (Production Mode)..." -ForegroundColor Green
Write-Host ""

$angularPath = Join-Path $scriptRoot "SCMS"
$wwwrootPath = Join-Path $scriptRoot "API\wwwroot"

# Check if Angular project exists
if (-not (Test-Path $angularPath)) {
    Write-Host "❌ Error: Angular project not found at $angularPath" -ForegroundColor Red
    exit 1
}

# Navigate to Angular project
Set-Location $angularPath

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing Angular dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install Angular dependencies" -ForegroundColor Red
        exit 1
    }
}

# Clean wwwroot folder
Write-Host "🧹 Cleaning wwwroot folder..." -ForegroundColor Yellow
if (Test-Path $wwwrootPath) {
    Remove-Item -Path $wwwrootPath -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $wwwrootPath -ItemType Directory -Force | Out-Null

# Build Angular in production mode
Write-Host "🔨 Building Angular application in production mode..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Angular build failed" -ForegroundColor Red
    exit 1
}

# Verify build output
if (-not (Test-Path $wwwrootPath) -or (Get-ChildItem $wwwrootPath -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
    Write-Host "❌ Error: Angular build output not found or empty in $wwwrootPath" -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem $wwwrootPath -Recurse -File | Measure-Object).Count
Write-Host "✅ Angular build completed successfully!" -ForegroundColor Green
Write-Host "   Output: $wwwrootPath" -ForegroundColor Gray
Write-Host "   Files created: $fileCount" -ForegroundColor Gray
Write-Host ""

# Step 2: Publish .NET API
Write-Host "📦 Step 2: Publishing .NET API (Production Mode)..." -ForegroundColor Green
Write-Host ""

# Navigate back to root
Set-Location $scriptRoot

# Generate timestamp for folder name
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$publishFolderName = "scms_$timestamp"
$publishPath = Join-Path $scriptRoot $publishFolderName

Write-Host "📁 Publish folder: $publishPath" -ForegroundColor Cyan
Write-Host ""

# Check if API project exists
$apiProjectPath = Join-Path $scriptRoot "API\API.csproj"
if (-not (Test-Path $apiProjectPath)) {
    Write-Host "❌ Error: API project not found at $apiProjectPath" -ForegroundColor Red
    exit 1
}

# Clean publish folder if it exists
if (Test-Path $publishPath) {
    Write-Host "🧹 Cleaning existing publish folder..." -ForegroundColor Yellow
    Remove-Item -Path $publishPath -Recurse -Force
}

# Publish .NET API in Release configuration
Write-Host "🔨 Publishing .NET API in Release mode..." -ForegroundColor Yellow
dotnet publish $apiProjectPath `
    --configuration Release `
    --output $publishPath `
    --self-contained false `
    --verbosity minimal

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: .NET publish failed" -ForegroundColor Red
    exit 1
}

# Verify publish output
if (-not (Test-Path $publishPath) -or (Get-ChildItem $publishPath -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
    Write-Host "❌ Error: .NET publish output not found or empty in $publishPath" -ForegroundColor Red
    exit 1
}

$publishFileCount = (Get-ChildItem $publishPath -Recurse -File | Measure-Object).Count
Write-Host "✅ .NET API published successfully!" -ForegroundColor Green
Write-Host "   Output: $publishPath" -ForegroundColor Gray
Write-Host "   Files created: $publishFileCount" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Publish Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Angular build output:" -ForegroundColor Yellow
Write-Host "   $wwwrootPath" -ForegroundColor White
Write-Host ""
Write-Host "📦 .NET API publish output:" -ForegroundColor Yellow
Write-Host "   $publishPath" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now deploy the contents of:" -ForegroundColor Cyan
Write-Host "   $publishPath" -ForegroundColor White
Write-Host ""
Write-Host "📝 Note: The Angular app is already included in wwwroot" -ForegroundColor Gray
Write-Host ""

