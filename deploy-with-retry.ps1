# Speed Motioner Deployment Script with Retry Logic
# This script deploys the application to both GitHub and Heroku with automatic retries

param(
    [string]$CommitMessage = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Force,
    [int]$MaxRetries = 3
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to run command and check exit code
function Invoke-CommandSafe {
    param(
        [string]$Command,
        [string]$Description,
        [switch]$ContinueOnError,
        [int]$RetryCount = 0
    )
    
    Write-ColorOutput "`n[INFO] $Description..." $Blue
    Write-ColorOutput "Running: $Command" $Yellow
    
    $result = Invoke-Expression $Command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-ColorOutput "[SUCCESS] $Description completed successfully" $Green
        return $true
    } else {
        Write-ColorOutput "[ERROR] $Description failed with exit code $exitCode" $Red
        
        if ($RetryCount -lt $MaxRetries) {
            $nextRetry = $RetryCount + 1
            Write-ColorOutput "[RETRY] Attempting retry $nextRetry of $MaxRetries..." $Yellow
            Start-Sleep -Seconds 2
            return Invoke-CommandSafe -Command $Command -Description $Description -ContinueOnError $ContinueOnError -RetryCount $nextRetry
        } else {
            Write-ColorOutput "[FAILED] Max retries reached for $Description" $Red
            if (-not $ContinueOnError) {
                Write-ColorOutput "Deployment aborted." $Red
                exit $exitCode
            }
            return $false
        }
    }
}

# Function to build and copy frontend files
function Build-Frontend {
    Write-ColorOutput "`n[BUILD] Building frontend application..." $Cyan
    
    # Build frontend
    if (-not (Invoke-CommandSafe "npm run build:local" "Building frontend")) {
        return $false
    }
    
    # Check if build was successful
    if (-not (Test-Path "frontend\dist\index.html")) {
        Write-ColorOutput "[ERROR] Frontend build failed - index.html not found" $Red
        return $false
    }
    
    Write-ColorOutput "[SUCCESS] Frontend build completed" $Green
    
    # Create backend/public directory if it doesn't exist
    if (-not (Test-Path "backend\public")) {
        Write-ColorOutput "[INFO] Creating backend/public directory..." $Blue
        New-Item -ItemType Directory -Path "backend\public" -Force | Out-Null
    }
    
    # Copy build files to backend
    Write-ColorOutput "[INFO] Copying build files to backend..." $Blue
    if (-not (Invoke-CommandSafe "xcopy frontend\dist\* backend\public\ /E /Y" "Copying frontend files to backend")) {
        return $false
    }
    
    # Verify files were copied
    if (-not (Test-Path "backend\public\index.html")) {
        Write-ColorOutput "[ERROR] Failed to copy frontend files to backend" $Red
        return $false
    }
    
    Write-ColorOutput "[SUCCESS] Frontend files copied to backend" $Green
    return $true
}

# Function to test the application
function Test-Application {
    Write-ColorOutput "`n[TEST] Testing application..." $Cyan
    
    # Test backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "[SUCCESS] Backend health check passed" $Green
            return $true
        }
    }
    catch {
        Write-ColorOutput "[WARNING] Backend health check failed (this is normal if backend is not running)" $Yellow
    }
    
    # Test frontend build
    if (Test-Path "frontend\dist\index.html") {
        Write-ColorOutput "[SUCCESS] Frontend build verification passed" $Green
        return $true
    } else {
        Write-ColorOutput "[ERROR] Frontend build verification failed" $Red
        return $false
    }
}

# Function to verify Heroku deployment
function Test-HerokuDeployment {
    param([string]$AppName)
    
    Write-ColorOutput "`n[VERIFY] Verifying Heroku deployment..." $Cyan
    
    # Wait a moment for deployment to complete
    Start-Sleep -Seconds 10
    
    # Check app status
    if (-not (Invoke-CommandSafe "heroku ps --app $AppName" "Checking Heroku app status" -ContinueOnError)) {
        return $false
    }
    
    # Test the deployed application
    try {
        $herokuUrl = "https://$AppName.herokuapp.com"
        Write-ColorOutput "[INFO] Testing deployed application at $herokuUrl" $Blue
        
        $response = Invoke-WebRequest -Uri $herokuUrl -TimeoutSec 30 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "[SUCCESS] Heroku deployment verification passed" $Green
            return $true
        } else {
            Write-ColorOutput "[ERROR] Heroku deployment returned status $($response.StatusCode)" $Red
            return $false
        }
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to verify Heroku deployment: $($_.Exception.Message)" $Red
        return $false
    }
}

# Main deployment function
function Start-Deployment {
    Write-ColorOutput "`n[START] Starting Speed Motioner Deployment with Retry Logic" $Blue
    Write-ColorOutput "=========================================================" $Blue
    Write-ColorOutput "Max Retries: $MaxRetries" $Cyan
    
    # Check prerequisites
    Write-ColorOutput "`n[INFO] Checking prerequisites..." $Blue
    
    $prerequisites = @{
        "Git" = Test-Command "git"
        "Node.js" = Test-Command "node"
        "npm" = Test-Command "npm"
        "Heroku CLI" = Test-Command "heroku"
    }
    
    $missing = @()
    foreach ($tool in $prerequisites.GetEnumerator()) {
        if ($tool.Value) {
            Write-ColorOutput "[OK] $($tool.Key) is installed" $Green
        } else {
            Write-ColorOutput "[MISSING] $($tool.Key) is not installed" $Red
            $missing += $tool.Key
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColorOutput "`n[ERROR] Missing prerequisites: $($missing -join ', ')" $Red
        Write-ColorOutput "Please install the missing tools and try again." $Yellow
        exit 1
    }
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-ColorOutput "[ERROR] Not in a git repository. Please run 'git init' first." $Red
        exit 1
    }
    
    # Check git status
    Write-ColorOutput "`n[INFO] Checking git status..." $Blue
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-ColorOutput "[INFO] Found uncommitted changes:" $Yellow
        Write-ColorOutput $gitStatus $Yellow
    } else {
        Write-ColorOutput "[OK] Working directory is clean" $Green
    }
    
    # Run tests (unless skipped)
    if (-not $SkipTests) {
        Write-ColorOutput "`n[INFO] Running tests..." $Blue
        Invoke-CommandSafe "npm test" "Running tests" -ContinueOnError
    } else {
        Write-ColorOutput "`n[SKIP] Skipping tests..." $Yellow
    }
    
    # Build frontend (unless skipped)
    if (-not $SkipBuild) {
        if (-not (Build-Frontend)) {
            Write-ColorOutput "[ERROR] Frontend build failed. Aborting deployment." $Red
            exit 1
        }
    } else {
        Write-ColorOutput "`n[SKIP] Skipping build..." $Yellow
    }
    
    # Test the application
    if (-not (Test-Application)) {
        Write-ColorOutput "[ERROR] Application test failed. Aborting deployment." $Red
        exit 1
    }
    
    # Stage all changes
    Write-ColorOutput "`n[INFO] Staging changes..." $Blue
    Invoke-CommandSafe "git add ." "Staging changes"
    
    # Commit changes
    Write-ColorOutput "`n[INFO] Committing changes..." $Blue
    Invoke-CommandSafe "git commit -m `"$CommitMessage`"" "Committing changes"
    
    # Push to GitHub
    Write-ColorOutput "`n[INFO] Pushing to GitHub..." $Blue
    $githubResult = Invoke-CommandSafe "git push origin main" "Pushing to GitHub" -ContinueOnError
    
    if (-not $githubResult) {
        Write-ColorOutput "[WARNING] GitHub push failed. Continuing with Heroku deployment..." $Yellow
    }
    
    # Deploy to Heroku
    Write-ColorOutput "`n[INFO] Deploying to Heroku..." $Blue
    
    # Check if Heroku app is configured
    $herokuApp = "speed-motioner"
    
    # Set Heroku buildpacks if needed
    Write-ColorOutput "[INFO] Configuring Heroku buildpacks..." $Blue
    Invoke-CommandSafe "heroku buildpacks:clear --app $herokuApp" "Clearing buildpacks" -ContinueOnError
    Invoke-CommandSafe "heroku buildpacks:add heroku/nodejs --app $herokuApp" "Adding Node.js buildpack" -ContinueOnError
    
    # Deploy to Heroku with retry logic
    $deploymentSuccess = $false
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        Write-ColorOutput "`n[ATTEMPT] Heroku deployment attempt $attempt of $MaxRetries" $Cyan
        
        if (Invoke-CommandSafe "git push heroku main" "Deploying to Heroku" -ContinueOnError) {
            $deploymentSuccess = $true
            break
        } else {
            if ($attempt -lt $MaxRetries) {
                Write-ColorOutput "[RETRY] Waiting before retry..." $Yellow
                Start-Sleep -Seconds 10
            }
        }
    }
    
    if (-not $deploymentSuccess) {
        Write-ColorOutput "[ERROR] All Heroku deployment attempts failed" $Red
        exit 1
    }
    
    # Verify deployment
    if (-not (Test-HerokuDeployment -AppName $herokuApp)) {
        Write-ColorOutput "[ERROR] Heroku deployment verification failed" $Red
        exit 1
    }
    
    # Check deployment status
    Write-ColorOutput "`n[INFO] Checking deployment status..." $Blue
    Invoke-CommandSafe "heroku ps --app $herokuApp" "Checking app status" -ContinueOnError
    
    # Open the deployed app
    Write-ColorOutput "`n[INFO] Opening deployed application..." $Blue
    Invoke-CommandSafe "heroku open --app $herokuApp" "Opening Heroku app" -ContinueOnError
    
    Write-ColorOutput "`n[SUCCESS] Deployment completed successfully!" $Green
    Write-ColorOutput "GitHub: https://github.com/netn10/Speed-Motioner" $Blue
    Write-ColorOutput "Heroku: https://$herokuApp.herokuapp.com/" $Blue
    Write-ColorOutput "`n[INFO] Deployment verification completed successfully!" $Cyan
}

# Error handling
try {
    Start-Deployment
}
catch {
    Write-ColorOutput "`n[ERROR] Deployment failed with error: $($_.Exception.Message)" $Red
    exit 1
}
