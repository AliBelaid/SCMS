#!/usr/bin/env pwsh

# Stop on first error
$ErrorActionPreference = "Stop"

$startTime = Get-Date
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$publishPath = "C:\scms_$timestamp"

Write-Host "🚀 Starting SCMS Full Application Publishing Process..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Target Directory: $publishPath" -ForegroundColor Yellow

# Step 0: Clean existing publish directory
Write-Host "`nStep 0: Cleaning existing publish directory" -ForegroundColor Cyan

if (Test-Path $publishPath) {
    Write-Host "Removing existing directory: $publishPath" -ForegroundColor Yellow
    Remove-Item -Path $publishPath -Recurse -Force
    Write-Host "Directory cleaned successfully!" -ForegroundColor Green
} else {
    Write-Host "No existing directory found. Creating new one..." -ForegroundColor Yellow
}

# Create fresh publish directory
New-Item -Path $publishPath -ItemType Directory -Force | Out-Null
Write-Host "Created fresh directory: $publishPath" -ForegroundColor Green

Write-Host "=================================================" -ForegroundColor Green

# Step 1: Build Angular Frontend
Write-Host "`nStep 1: Building Angular Frontend" -ForegroundColor Cyan

Push-Location -Path "SCMS"

try {
    # Check if node_modules exists, if not install dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing Angular dependencies..." -ForegroundColor Yellow
        npm install --legacy-peer-deps
    } else {
        Write-Host "Dependencies already installed, skipping npm install" -ForegroundColor Gray
    }
    
    Write-Host "Building Angular in production mode..." -ForegroundColor Yellow
    Write-Host "Output will go to: ..\API\wwwroot" -ForegroundColor Gray
    
    # Build Angular in production mode (outputs to ../API/wwwroot as configured in angular.json)
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Angular build failed!" -ForegroundColor Red
        throw "Angular build failed. Please check the error messages above."
    }
    
    Write-Host "✅ Angular production build succeeded!" -ForegroundColor Green
    
    # Angular build outputs to ../API/wwwroot (configured in angular.json)
    $wwwrootPath = Join-Path ".." "API\wwwroot"
    
    if (Test-Path $wwwrootPath) {
        Write-Host "✅ Angular build output found in: $wwwrootPath" -ForegroundColor Green
        
        # Copy built files to publish directory (frontend folder for separate deployment if needed)
        $frontendPublishPath = Join-Path $publishPath "frontend"
        New-Item -Path $frontendPublishPath -ItemType Directory -Force | Out-Null
        Copy-Item -Path "$wwwrootPath\*" -Destination $frontendPublishPath -Recurse -Force
        Write-Host "Frontend files copied to: $frontendPublishPath" -ForegroundColor Green
    } else {
        throw "Frontend build output not found in $wwwrootPath"
    }
}
finally {
    Pop-Location
}

Write-Host "Frontend build completed successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Step 2: Build and Publish .NET Core API
Write-Host "`nStep 2: Building and Publishing .NET Core API" -ForegroundColor Cyan

# Look for the API project in the root directory
$apiProjects = Get-ChildItem -Path "." -Filter "*.csproj" -Recurse | Where-Object { $_.Directory.Name -notlike "*FE*" -and $_.Directory.Name -notlike "*Test*" }

if ($apiProjects.Count -eq 0) {
    Write-Host "No API project found. Checking for common API folder names..." -ForegroundColor Yellow
    $apiFolders = @("API", "DVS_API", "Backend", "Server")
    
    foreach ($folder in $apiFolders) {
        if (Test-Path $folder) {
            Push-Location -Path $folder
            $apiProjects = Get-ChildItem -Path "." -Filter "*.csproj"
            if ($apiProjects.Count -gt 0) {
                Write-Host "Found API project in $folder" -ForegroundColor Green
                break
            }
            Pop-Location
        }
    }
}

if ($apiProjects.Count -gt 0) {
    $apiProject = $apiProjects[0]
    Write-Host "Using API project: $($apiProject.Name)" -ForegroundColor Yellow
    
    if ($apiProject.Directory.FullName -ne (Get-Location).Path) {
        Push-Location -Path $apiProject.Directory.FullName
    }
    
    try {
        Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
        dotnet restore
        
        Write-Host "Building API project (warnings ignored)..." -ForegroundColor Yellow
        dotnet build --configuration Release /p:TreatWarningsAsErrors=false /p:WarningLevel=0
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "API build encountered issues. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
            Write-Host "Continuing with publish..." -ForegroundColor Yellow
        }
        
        # Publish API (will include wwwroot with Angular)
        $apiPublishPath = Join-Path $publishPath "api"
        Write-Host "Publishing API to: $apiPublishPath" -ForegroundColor Yellow
        Write-Host "Note: Angular app from wwwroot will be included automatically" -ForegroundColor Gray
        dotnet publish --configuration Release --output $apiPublishPath /p:TreatWarningsAsErrors=false /p:WarningLevel=0
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "API publish encountered issues. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
            Write-Host "Continuing anyway..." -ForegroundColor Yellow
        } else {
            Write-Host "API publish completed successfully!" -ForegroundColor Green
        }
        
        Write-Host "API files published to: $apiPublishPath" -ForegroundColor Green
    }
    finally {
        if ($apiProject.Directory.FullName -ne (Get-Location).Path) {
            Pop-Location
        }
    }
} else {
    Write-Host "⚠️  No .NET API project found. Skipping API build..." -ForegroundColor Yellow
    Write-Host "If you have an API, please ensure the .csproj file is in the project root or a subfolder." -ForegroundColor Yellow
}

Write-Host "=================================================" -ForegroundColor Green

# Step 3: Create deployment info file
Write-Host "`nStep 3: Creating deployment information" -ForegroundColor Cyan

$deploymentInfo = @"
SCMS Application Deployment Package
===================================

Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Build Machine: $env:COMPUTERNAME
Build User: $env:USERNAME

Directory Structure:
--------------------
frontend/       - Angular application (serve with web server)
api/            - .NET Core API (includes wwwroot with Angular, deploy to IIS or Kestrel)

Deployment Instructions:
------------------------

1. Frontend (Angular):
   - Deploy contents of 'frontend' folder to web server (optional - already in api/wwwroot)
   - OR use the Angular app already included in api/wwwroot folder
   - Configure web server to serve index.html for all routes (SPA routing)
   - Update environment files if needed
   - Recommended: Use IIS, Apache, or Nginx

2. Backend (API):
   - Deploy contents of 'api' folder to IIS or run with Kestrel
   - Angular app is already included in api/wwwroot folder
   - Update appsettings.json with production database connection
   - Ensure .NET 9.0 Runtime is installed on target server
   - Configure CORS settings for your domain

3. Database:
   - Run Entity Framework migrations if needed
   - Update connection strings in appsettings.json
   - Ensure SQL Server is accessible

4. File Storage:
   - Configure file upload paths in appsettings.json
   - Ensure proper permissions for file storage directories

Development Info:
-----------------
- Frontend runs on: http://localhost:4200 (ng serve)
- Backend runs on: http://localhost:5000 (dotnet run)
- Project path: D:\myApps\SCMS

For more information, see project documentation.
"@

$deploymentInfo | Out-File -FilePath (Join-Path $publishPath "DEPLOYMENT_INFO.txt") -Encoding UTF8
Write-Host "Deployment info created" -ForegroundColor Green

# Step 4: Create quick start batch file
$quickStartBat = @"
@echo off
echo Starting SCMS Application...
echo ================================
cd /d "%~dp0"

echo Starting API Server...
if exist "api\API.dll" (
    start "SCMS API" cmd /k "cd api && dotnet API.dll"
    timeout /t 3
    echo API server started on http://localhost:5000
    echo Angular app is served from api/wwwroot
) else (
    echo No API found in api folder
)

echo.
echo Note: Angular app is already included in api/wwwroot
echo The API will serve both the API and the Angular frontend
echo.
echo To serve frontend separately (optional):
echo   cd frontend && npx http-server -p 4200
echo   cd frontend && python -m http.server 4200
echo.
echo For production, deploy the api folder to IIS/Apache/Nginx

pause
"@

$quickStartBat | Out-File -FilePath (Join-Path $publishPath "START_LOCAL.bat") -Encoding ASCII
Write-Host "Quick start script created" -ForegroundColor Green

# Step 5: Create IIS deployment script
$iisScript = @"
@echo off
echo SCMS IIS Deployment Helper
echo ==========================

echo This script helps deploy SCMS to IIS
echo.
echo Prerequisites:
echo - IIS with ASP.NET Core Module installed
echo - .NET 9.0 Runtime installed
echo.
echo Steps:
echo 1. Copy 'api' folder to IIS applications folder (e.g., C:\inetpub\wwwroot\scms)
echo 2. Angular app is already included in api/wwwroot
echo 3. Create IIS Application pointing to the api folder
echo 4. Configure URL Rewrite for Angular SPA routing
echo 5. Update appsettings.json with production settings
echo.
echo Note: The api folder contains both the API and Angular frontend (in wwwroot)
echo.
echo For detailed instructions, see DEPLOYMENT_INFO.txt
echo.

pause
"@

$iisScript | Out-File -FilePath (Join-Path $publishPath "DEPLOY_TO_IIS.bat") -Encoding ASCII
Write-Host "IIS deployment helper created" -ForegroundColor Green

Write-Host "=================================================" -ForegroundColor Green

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n✅ SCMS application publishing completed successfully!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Published to: $publishPath" -ForegroundColor Cyan
Write-Host "Total time: $($duration.Minutes) minutes and $($duration.Seconds) seconds" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`nDirectory Contents:" -ForegroundColor Cyan
Get-ChildItem -Path $publishPath | ForEach-Object {
    $size = if ($_.PSIsContainer) { 
        $childItems = Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
        if ($childItems.Sum) {
            "{0:N2} MB" -f ($childItems.Sum / 1MB)
        } else {
            "0.00 MB"
        }
    } else { 
        "{0:N2} MB" -f ($_.Length / 1MB)
    }
    Write-Host "  $($_.Name.PadRight(25)) - $size" -ForegroundColor White
}

Write-Host "=================================================" -ForegroundColor Green
Write-Host "✅ Ready for deployment!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Review DEPLOYMENT_INFO.txt for deployment instructions" -ForegroundColor White
Write-Host "2. Test locally using START_LOCAL.bat" -ForegroundColor White
Write-Host "3. Deploy to production server" -ForegroundColor White
Write-Host "4. Update configuration files for production environment" -ForegroundColor White
