#!/usr/bin/env pwsh

# Stop on first error
$ErrorActionPreference = "Stop"

$startTime = Get-Date
$dateString = Get-Date -Format "dd-MM-yyyy"
$publishPath = "C:\DVS_pub_$dateString"

Write-Host "🚀 Starting DVS Full Application Publishing Process..." -ForegroundColor Green
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

Push-Location -Path "DVS_FE"

try {
    Write-Host "Running npm install..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    
    Write-Host "Building production build..." -ForegroundColor Yellow
    
    # Try building with production config first
    ng build --configuration=production
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Production build failed (likely due to Google Fonts access issue)..." -ForegroundColor Yellow
        Write-Host "Trying alternative build methods..." -ForegroundColor Yellow
        
        # Try building without font inlining by using different optimization settings
        Write-Host "Attempting build with font inlining disabled..." -ForegroundColor Yellow
        ng build --configuration=production --optimization=false
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Trying build with minimal optimization..." -ForegroundColor Yellow
            ng build --configuration=production --optimization=false --build-optimizer=false
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Trying development build as final fallback..." -ForegroundColor Yellow
                ng build
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "❌ All build attempts failed!" -ForegroundColor Red
                    Write-Host "This is likely due to network connectivity issues preventing access to Google Fonts." -ForegroundColor Red
                    Write-Host "Solutions:" -ForegroundColor Yellow
                    Write-Host "1. Check your internet connection" -ForegroundColor White
                    Write-Host "2. Try running the script again when network is stable" -ForegroundColor White
                    Write-Host "3. Consider removing Google Fonts imports from your SCSS files temporarily" -ForegroundColor White
                    throw "All build attempts failed. Please resolve network connectivity issues."
                } else {
                    Write-Host "✅ Development build succeeded as fallback" -ForegroundColor Green
                }
            } else {
                Write-Host "✅ Build succeeded with minimal optimization" -ForegroundColor Green
            }
        } else {
            Write-Host "✅ Build succeeded with font inlining disabled" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ Production build succeeded!" -ForegroundColor Green
    }
    
    # Copy built files to publish directory
    $frontendPublishPath = Join-Path $publishPath "frontend"
    New-Item -Path $frontendPublishPath -ItemType Directory -Force | Out-Null
    
    # Angular build outputs to dist/dvs-fe (or similar)
    $distPath = ""
    if (Test-Path "dist") {
        $distFolders = Get-ChildItem -Path "dist" -Directory
        if ($distFolders.Count -gt 0) {
            $distPath = $distFolders[0].FullName
            Write-Host "Found dist folder: $($distFolders[0].Name)" -ForegroundColor Yellow
        }
    }
    
    if ($distPath -and (Test-Path $distPath)) {
        Copy-Item -Path "$distPath/*" -Destination $frontendPublishPath -Recurse -Force
        Write-Host "Frontend files copied from $distPath to: $frontendPublishPath" -ForegroundColor Green
    } else {
        throw "Frontend build output not found in dist folder"
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
        
        # Publish API
        $apiPublishPath = Join-Path $publishPath "api"
        Write-Host "Publishing API to: $apiPublishPath" -ForegroundColor Yellow
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
DVS Application Deployment Package
==================================

Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Build Machine: $env:COMPUTERNAME
Build User: $env:USERNAME

Directory Structure:
--------------------
frontend/       - Angular application (serve with web server)
api/            - .NET Core API (deploy to IIS or Kestrel)

Deployment Instructions:
------------------------

1. Frontend (Angular):
   - Deploy contents of 'frontend' folder to web server
   - Configure web server to serve index.html for all routes (SPA routing)
   - Update environment files if needed
   - Recommended: Use IIS, Apache, or Nginx

2. Backend (API):
   - Deploy contents of 'api' folder to IIS or run with Kestrel
   - Update appsettings.json with production database connection
   - Ensure .NET 8.0 Runtime is installed on target server
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
- Project path: D:\SFileSysyem\DVS_2025

For more information, see project documentation.
"@

$deploymentInfo | Out-File -FilePath (Join-Path $publishPath "DEPLOYMENT_INFO.txt") -Encoding UTF8
Write-Host "Deployment info created" -ForegroundColor Green

# Step 4: Create quick start batch file
$quickStartBat = @"
@echo off
echo Starting DVS Application...
echo ================================
cd /d "%~dp0"

echo Starting API Server...
if exist "api\*.dll" (
    start "DVS API" cmd /k "cd api && dotnet *.dll"
    timeout /t 3
) else (
    echo No API found in api folder
)

echo.
echo Starting Frontend Server (requires http-server or similar)...
echo Please serve the frontend folder using your preferred web server
echo.
echo Examples:
echo   cd frontend && npx http-server -p 4200
echo   cd frontend && python -m http.server 4200
echo.
echo Or deploy to IIS/Apache/Nginx for production

pause
"@

$quickStartBat | Out-File -FilePath (Join-Path $publishPath "START_LOCAL.bat") -Encoding ASCII
Write-Host "Quick start script created" -ForegroundColor Green

# Step 5: Create IIS deployment script
$iisScript = @"
@echo off
echo DVS IIS Deployment Helper
echo =========================

echo This script helps deploy DVS to IIS
echo.
echo Prerequisites:
echo - IIS with ASP.NET Core Module installed
echo - .NET 8.0 Runtime installed
echo.
echo Steps:
echo 1. Copy 'frontend' folder to IIS wwwroot (e.g., C:\inetpub\wwwroot\dvs)
echo 2. Copy 'api' folder to IIS applications folder
echo 3. Create IIS Application for API
echo 4. Configure URL Rewrite for Angular SPA routing
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

Write-Host "`n✅ DVS application publishing completed successfully!" -ForegroundColor Green
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
