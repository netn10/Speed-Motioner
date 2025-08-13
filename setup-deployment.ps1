# Speed Motioner Deployment Setup Script
# This script helps set up the deployment environment

param(
    [switch]$SkipHerokuSetup
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
    
    Write-ColorOutput "🔄 $Description..." $Blue
    Write-ColorOutput "Running: $Command" $Yellow
    
    $result = Invoke-Expression $Command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-ColorOutput "✅ $Description completed successfully" $Green
        return $true
    } else {
        Write-ColorOutput "❌ $Description failed with exit code $exitCode" $Red
        if (-not $ContinueOnError) {
            Write-ColorOutput "Setup aborted." $Red
            exit $exitCode
        }
        return $false
    }
}

# Main setup function
function Start-Setup {
    Write-ColorOutput "`n🚀 Speed Motioner Deployment Setup" $Blue
    Write-ColorOutput "===================================" $Blue
    
    # Check prerequisites
    Write-ColorOutput "`n📋 Checking prerequisites..." $Blue
    
    $prerequisites = @{
        "Git" = Test-Command "git"
        "Node.js" = Test-Command "node"
        "npm" = Test-Command "npm"
        "Heroku CLI" = Test-Command "heroku"
    }
    
    $missing = @()
    foreach ($tool in $prerequisites.GetEnumerator()) {
        if ($tool.Value) {
            Write-ColorOutput "✅ $($tool.Key) is installed" $Green
        } else {
            Write-ColorOutput "❌ $($tool.Key) is not installed" $Red
            $missing += $tool.Key
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColorOutput "`n❌ Missing prerequisites: $($missing -join ', ')" $Red
        Write-ColorOutput "Please install the missing tools:" $Yellow
        
        foreach ($tool in $missing) {
            switch ($tool) {
                "Git" { Write-ColorOutput "  - Git: winget install Git.Git" $Yellow }
                "Node.js" { Write-ColorOutput "  - Node.js: winget install OpenJS.NodeJS" $Yellow }
                "Heroku CLI" { Write-ColorOutput "  - Heroku CLI: winget install Heroku.HerokuCLI" $Yellow }
            }
        }
        
        Write-ColorOutput "`nAfter installing, run this script again." $Yellow
        exit 1
    }
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-ColorOutput "`n📦 Initializing git repository..." $Blue
        Invoke-CommandSafe "git init" "Initializing git repository"
    } else {
        Write-ColorOutput "✅ Git repository already initialized" $Green
    }
    
    # Check git configuration
    Write-ColorOutput "`n🔧 Checking git configuration..." $Blue
    $gitUser = git config --global user.name
    $gitEmail = git config --global user.email
    
    if (-not $gitUser -or -not $gitEmail) {
        Write-ColorOutput "⚠️ Git user configuration is missing" $Yellow
        Write-ColorOutput "Please configure git with your credentials:" $Yellow
        Write-ColorOutput "  git config --global user.name 'Your Name'" $Yellow
        Write-ColorOutput "  git config --global user.email 'your.email@example.com'" $Yellow
    } else {
        Write-ColorOutput "✅ Git configured as: $gitUser <$gitEmail>" $Green
    }
    
    # Check if GitHub remote is configured
    Write-ColorOutput "`n🌐 Checking GitHub remote..." $Blue
    $githubRemote = git remote get-url origin 2>$null
    
    if (-not $githubRemote) {
        Write-ColorOutput "⚠️ GitHub remote not configured" $Yellow
        Write-ColorOutput "Adding GitHub remote..." $Blue
        Invoke-CommandSafe "git remote add origin https://github.com/netn10/Speed-Motioner.git" "Adding GitHub remote"
    } else {
        Write-ColorOutput "✅ GitHub remote configured: $githubRemote" $Green
    }
    
    # Setup Heroku (unless skipped)
    if (-not $SkipHerokuSetup) {
        Write-ColorOutput "`n☁️ Setting up Heroku..." $Blue
        
        # Check if Heroku is logged in
        $herokuAuth = heroku auth:whoami 2>$null
        if (-not $herokuAuth) {
            Write-ColorOutput "⚠️ Not logged into Heroku" $Yellow
            Write-ColorOutput "Please log in to Heroku:" $Yellow
            Write-ColorOutput "  heroku login" $Yellow
            Write-ColorOutput "Then run this script again." $Yellow
            exit 1
        } else {
            Write-ColorOutput "✅ Logged into Heroku as: $herokuAuth" $Green
        }
        
        # Check if Heroku remote is configured
        $herokuRemote = git remote get-url heroku 2>$null
        
        if (-not $herokuRemote) {
            Write-ColorOutput "Adding Heroku remote..." $Blue
            Invoke-CommandSafe "heroku git:remote -a speed-motioner-640587c36085" "Adding Heroku remote"
        } else {
            Write-ColorOutput "✅ Heroku remote configured: $herokuRemote" $Green
        }
        
        # Setup Heroku buildpacks
        Write-ColorOutput "Configuring Heroku buildpacks..." $Blue
        Invoke-CommandSafe "npm run setup:heroku" "Setting up Heroku buildpacks"
    } else {
        Write-ColorOutput "⏭️ Skipping Heroku setup..." $Yellow
    }
    
    # Install dependencies
    Write-ColorOutput "`n📦 Installing dependencies..." $Blue
    Invoke-CommandSafe "npm run install-all" "Installing all dependencies"
    
    # Test the setup
    Write-ColorOutput "`n🧪 Testing setup..." $Blue
    Invoke-CommandSafe "npm run build" "Building frontend" -ContinueOnError
    
    Write-ColorOutput "`n🎉 Setup completed successfully!" $Green
    Write-ColorOutput "`n📚 Next steps:" $Blue
    Write-ColorOutput "1. Run tests: npm test" $Yellow
    Write-ColorOutput "2. Start development: npm run dev" $Yellow
    Write-ColorOutput "3. Deploy to GitHub and Heroku: npm run deploy" $Yellow
    Write-ColorOutput "`n📖 For more information, see DEPLOYMENT.md" $Blue
}

# Error handling
try {
    Start-Setup
}
catch {
    Write-ColorOutput "`n💥 Setup failed with error: $($_.Exception.Message)" $Red
    exit 1
}
