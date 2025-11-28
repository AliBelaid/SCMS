#!/usr/bin/env pwsh

# Stop on first error
$ErrorActionPreference = "Stop"

# Parameters
$outputFolder = "../API/wwwroot"

Write-Host "🚀 Publishing HEMS Frontend..." -ForegroundColor Green

# Ensure the output directory exists and is empty
if (Test-Path $outputFolder) {
    Remove-Item -Path $outputFolder -Recurse -Force
}
New-Item -Path $outputFolder -ItemType Directory | Out-Null

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Build for production
Write-Host "🔨 Building for production..." -ForegroundColor Cyan
npm run build -- --configuration=production --output-path=$outputFolder

Write-Host "✅ Frontend published successfully to $outputFolder" -ForegroundColor Green
Write-Host "The Angular app has been built and placed in the API's wwwroot folder." -ForegroundColor Yellow 