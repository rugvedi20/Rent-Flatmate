# Script to bundle and package the application into a clean zip file for assignment submission.

$SubmissionDir = Join-Path $PSScriptRoot "submission_temp"
$RentDir = Join-Path $SubmissionDir "Rent-Flatmate"
$ZipPath = Join-Path $PSScriptRoot "Rent-Flatmate.zip"

# Clean previous submission artifacts
if (Test-Path $SubmissionDir) { Remove-Item -Recurse -Force $SubmissionDir }
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }

Write-Host "Creating clean submission directory..." -ForegroundColor Green
New-Item -ItemType Directory -Path $RentDir | Out-Null

# Copy Root Files
$RootFiles = @("README.md", "API_DOCUMENTATION.md", "SYSTEM_DESIGN.md", ".gitignore")
foreach ($File in $RootFiles) {
    $FilePath = Join-Path $PSScriptRoot $File
    if (Test-Path $FilePath) {
        Copy-Item -Path $FilePath -Destination $RentDir
    }
}

# Copy server folder (excluding node_modules and .env)
Write-Host "Copying backend files..." -ForegroundColor Green
$ServerSource = Join-Path $PSScriptRoot "server"
$ServerDest = Join-Path $RentDir "server"
New-Item -ItemType Directory -Path $ServerDest | Out-Null

Get-ChildItem -Path $ServerSource | Where-Object { 
    $_.Name -ne "node_modules" -and $_.Name -ne ".env"
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $ServerDest -Recurse -Force
}

# Copy client folder (excluding node_modules and dist)
Write-Host "Copying frontend files..." -ForegroundColor Green
$ClientSource = Join-Path $PSScriptRoot "client"
$ClientDest = Join-Path $RentDir "client"
New-Item -ItemType Directory -Path $ClientDest | Out-Null

Get-ChildItem -Path $ClientSource | Where-Object {
    $_.Name -ne "node_modules" -and $_.Name -ne "dist"
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $ClientDest -Recurse -Force
}

# Compress into Zip
Write-Host "Compressing project into Rent-Flatmate.zip..." -ForegroundColor Green
Compress-Archive -Path $RentDir -DestinationPath $ZipPath -Force

# Clean up temp directories
Write-Host "Cleaning up temporary files..." -ForegroundColor Green
Remove-Item -Recurse -Force $SubmissionDir

Write-Host "Successfully generated Rent-Flatmate.zip in workspace root!" -ForegroundColor Cyan
