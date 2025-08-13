# Speed Motioner Deployment Script for Windows
# This script deploys the application to both GitHub and Heroku

param(
    [string]$CommitMessage = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

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
        [switch]$ContinueOnError
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
        if (-not $ContinueOnError) {
            Write-ColorOutput "Deployment aborted." $Red
            exit $exitCode
        }
        return $false
    }
}

# Main deployment function
function Start-Deployment {
    Write-ColorOutput "`n[START] Starting Speed Motioner Deployment" $Blue
    Write-ColorOutput "=============================================" $Blue
    
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
        Write-ColorOutput "`n[INFO] Building frontend..." $Blue
        Invoke-CommandSafe "npm run build" "Building frontend"
    } else {
        Write-ColorOutput "`n[SKIP] Skipping build..." $Yellow
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
    
    # Deploy to Heroku
    Invoke-CommandSafe "git push heroku main" "Deploying to Heroku"
    
    # Check deployment status
    Write-ColorOutput "`n[INFO] Checking deployment status..." $Blue
    Invoke-CommandSafe "heroku ps --app $herokuApp" "Checking app status" -ContinueOnError
    
    # Open the deployed app
    Write-ColorOutput "`n[INFO] Opening deployed application..." $Blue
    Invoke-CommandSafe "heroku open --app $herokuApp" "Opening Heroku app" -ContinueOnError
    
    Write-ColorOutput "`n[SUCCESS] Deployment completed successfully!" $Green
    Write-ColorOutput "GitHub: https://github.com/netn10/Speed-Motioner" $Blue
    Write-ColorOutput "Heroku: https://$herokuApp.herokuapp.com/" $Blue
}

# Error handling
try {
    Start-Deployment
}
catch {
    Write-ColorOutput "`n[ERROR] Deployment failed with error: $($_.Exception.Message)" $Red
    exit 1
}
