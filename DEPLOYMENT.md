# Speed Motioner Deployment Guide

This guide explains how to deploy the Speed Motioner application to both GitHub and Heroku using the provided deployment scripts.

## Prerequisites

Before using the deployment scripts, ensure you have the following tools installed:

- **Git** - Version control system
- **Node.js** - JavaScript runtime (version 16 or higher)
- **npm** - Node.js package manager
- **Heroku CLI** - Heroku command line interface

### Installing Prerequisites

#### Windows
```bash
# Install Git
winget install Git.Git

# Install Node.js
winget install OpenJS.NodeJS

# Install Heroku CLI
winget install Heroku.HerokuCLI
```

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git, Node.js, and Heroku CLI
brew install git node heroku
```

#### Linux (Ubuntu/Debian)
```bash
# Install Git
sudo apt update
sudo apt install git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh
```

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/netn10/Speed-Motioner.git
cd Speed-Motioner
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Heroku
```bash
# Login to Heroku
heroku login

# Add Heroku remote (if not already added)
heroku git:remote -a speed-motioner-640587c36085

# Setup Heroku buildpacks
npm run setup:heroku
```

## Deployment Scripts

The project includes several deployment scripts for different use cases:

### 1. PowerShell Script (Windows) - `deploy.ps1`

**Features:**
- Full-featured deployment script with colored output
- Prerequisite checking
- Test running (optional)
- Build process
- GitHub and Heroku deployment
- Error handling and recovery

**Usage:**
```powershell
# Basic deployment
.\deploy.ps1

# Custom commit message
.\deploy.ps1 -CommitMessage "Add new feature"

# Skip tests
.\deploy.ps1 -SkipTests

# Skip build
.\deploy.ps1 -SkipBuild

# Force deployment even if tests fail
.\deploy.ps1 -Force
```

### 2. Bash Script (Cross-platform) - `deploy.sh`

**Features:**
- Cross-platform compatibility
- Command-line argument parsing
- Colored output
- Comprehensive error handling

**Usage:**
```bash
# Make executable (Linux/macOS)
chmod +x deploy.sh

# Basic deployment
./deploy.sh

# Custom commit message
./deploy.sh -m "Add new feature"

# Skip tests
./deploy.sh --skip-tests

# Skip build
./deploy.sh --skip-build

# Force deployment
./deploy.sh -f

# Show help
./deploy.sh -h
```

### 3. Batch Script (Windows) - `deploy.bat`

**Features:**
- Simple Windows batch file
- Basic prerequisite checking
- Straightforward deployment process

**Usage:**
```cmd
deploy.bat
```

### 4. NPM Scripts

**Available commands:**
```bash
# Full deployment using PowerShell script
npm run deploy

# Deploy to GitHub only
npm run deploy:github

# Deploy to Heroku only
npm run deploy:heroku

# Full deployment (build + GitHub + Heroku)
npm run deploy:full

# Setup Heroku buildpacks
npm run setup:heroku
```

## Deployment Process

The deployment scripts perform the following steps:

1. **Prerequisite Check** - Verify all required tools are installed
2. **Git Status Check** - Check for uncommitted changes
3. **Test Execution** - Run tests (unless skipped)
4. **Build Process** - Build the frontend application
5. **Git Operations** - Stage, commit, and push changes
6. **Heroku Deployment** - Deploy to Heroku
7. **Status Verification** - Check deployment status

## Configuration Files

### Procfile
Specifies how Heroku should run the application:
```
web: cd backend && npm start
```

### app.json
Heroku application configuration:
```json
{
  "name": "Speed Motioner",
  "description": "A modern web-based fighting game training tool",
  "repository": "https://github.com/netn10/Speed-Motioner",
  "env": {
    "NODE_ENV": "production",
    "PORT": "5000"
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. Git Authentication
If you encounter authentication issues with Git:
```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use personal access token for GitHub
git remote set-url origin https://YOUR_TOKEN@github.com/netn10/Speed-Motioner.git
```

#### 2. Heroku Authentication
If Heroku CLI is not authenticated:
```bash
heroku login
```

#### 3. Build Failures
If the build process fails:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Heroku Buildpack Issues
If Heroku buildpacks are not configured correctly:
```bash
npm run setup:heroku
```

### Error Messages

| Error | Solution |
|-------|----------|
| `❌ Git is not installed` | Install Git from https://git-scm.com/ |
| `❌ Node.js is not installed` | Install Node.js from https://nodejs.org/ |
| `❌ Heroku CLI is not installed` | Install Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli |
| `❌ Not in a git repository` | Run `git init` in the project directory |
| `❌ Build failed` | Check for compilation errors in the frontend |
| `❌ Heroku deployment failed` | Check Heroku logs with `heroku logs --tail` |

## Manual Deployment

If you prefer to deploy manually:

### GitHub Deployment
```bash
# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### Heroku Deployment
```bash
# Deploy to Heroku
git push heroku main

# Check deployment status
heroku ps

# View logs
heroku logs --tail
```

## Continuous Deployment

For automated deployments, consider setting up:

1. **GitHub Actions** - Automate deployment on push to main branch
2. **Heroku GitHub Integration** - Enable automatic deployments from GitHub
3. **Webhooks** - Trigger deployments on specific events

## Monitoring

After deployment, monitor your application:

```bash
# Check Heroku app status
heroku ps --app speed-motioner-640587c36085

# View application logs
heroku logs --tail --app speed-motioner-640587c36085

# Open the application
heroku open --app speed-motioner-640587c36085
```

## URLs

- **GitHub Repository**: https://github.com/netn10/Speed-Motioner
- **Heroku Application**: https://speed-motioner-640587c36085.herokuapp.com/

## Support

If you encounter issues with deployment:

1. Check the troubleshooting section above
2. Review the error logs
3. Ensure all prerequisites are installed
4. Verify your Git and Heroku configurations

For additional help, please open an issue on the GitHub repository.
