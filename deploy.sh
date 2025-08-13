#!/bin/bash

# Speed Motioner Deployment Script
# This script deploys the application to both GitHub and Heroku

# Default values
COMMIT_MESSAGE="Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
SKIP_TESTS=false
SKIP_BUILD=false
FORCE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command and check exit code
run_command() {
    local command="$1"
    local description="$2"
    local continue_on_error="${3:-false}"
    
    print_color "$BLUE" "\n🔄 $description..."
    print_color "$YELLOW" "Running: $command"
    
    if eval "$command"; then
        print_color "$GREEN" "✅ $description completed successfully"
        return 0
    else
        local exit_code=$?
        print_color "$RED" "❌ $description failed with exit code $exit_code"
        if [ "$continue_on_error" = "false" ]; then
            print_color "$RED" "Deployment aborted."
            exit $exit_code
        fi
        return 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -m, --message TEXT    Commit message (default: auto-generated)"
            echo "  --skip-tests          Skip running tests"
            echo "  --skip-build          Skip building frontend"
            echo "  -f, --force           Force deployment even if tests fail"
            echo "  -h, --help            Show this help message"
            exit 0
            ;;
        *)
            print_color "$RED" "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main deployment function
main() {
    print_color "$BLUE" "\n🚀 Starting Speed Motioner Deployment"
    print_color "$BLUE" "====================================="
    
    # Check prerequisites
    print_color "$BLUE" "\n📋 Checking prerequisites..."
    
    local missing_tools=()
    
    if command_exists git; then
        print_color "$GREEN" "✅ Git is installed"
    else
        print_color "$RED" "❌ Git is not installed"
        missing_tools+=("Git")
    fi
    
    if command_exists node; then
        print_color "$GREEN" "✅ Node.js is installed"
    else
        print_color "$RED" "❌ Node.js is not installed"
        missing_tools+=("Node.js")
    fi
    
    if command_exists npm; then
        print_color "$GREEN" "✅ npm is installed"
    else
        print_color "$RED" "❌ npm is not installed"
        missing_tools+=("npm")
    fi
    
    if command_exists heroku; then
        print_color "$GREEN" "✅ Heroku CLI is installed"
    else
        print_color "$RED" "❌ Heroku CLI is not installed"
        missing_tools+=("Heroku CLI")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_color "$RED" "\n❌ Missing prerequisites: ${missing_tools[*]}"
        print_color "$YELLOW" "Please install the missing tools and try again."
        exit 1
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_color "$RED" "❌ Not in a git repository. Please run 'git init' first."
        exit 1
    fi
    
    # Check git status
    print_color "$BLUE" "\n📊 Checking git status..."
    local git_status=$(git status --porcelain)
    if [ -n "$git_status" ]; then
        print_color "$YELLOW" "📝 Found uncommitted changes:"
        print_color "$YELLOW" "$git_status"
    else
        print_color "$GREEN" "✅ Working directory is clean"
    fi
    
    # Run tests (unless skipped)
    if [ "$SKIP_TESTS" = false ]; then
        print_color "$BLUE" "\n🧪 Running tests..."
        if ! run_command "npm test" "Running tests" "true"; then
            if [ "$FORCE" = false ]; then
                print_color "$RED" "Tests failed. Use --force to continue anyway."
                exit 1
            else
                print_color "$YELLOW" "Tests failed, but continuing due to --force flag."
            fi
        fi
    else
        print_color "$YELLOW" "\n⏭️ Skipping tests..."
    fi
    
    # Build frontend (unless skipped)
    if [ "$SKIP_BUILD" = false ]; then
        print_color "$BLUE" "\n🔨 Building frontend..."
        run_command "npm run build" "Building frontend"
    else
        print_color "$YELLOW" "\n⏭️ Skipping build..."
    fi
    
    # Stage all changes
    print_color "$BLUE" "\n📦 Staging changes..."
    run_command "git add ." "Staging changes"
    
    # Commit changes
    print_color "$BLUE" "\n💾 Committing changes..."
    run_command "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
    
    # Push to GitHub
    print_color "$BLUE" "\n🌐 Pushing to GitHub..."
    if ! run_command "git push origin main" "Pushing to GitHub" "true"; then
        print_color "$YELLOW" "⚠️ GitHub push failed. Continuing with Heroku deployment..."
    fi
    
    # Deploy to Heroku
    print_color "$BLUE" "\n☁️ Deploying to Heroku..."
    
    # Heroku app name
    local heroku_app="speed-motioner-640587c36085"
    
    # Set Heroku buildpacks if needed
    print_color "$BLUE" "🔧 Configuring Heroku buildpacks..."
    run_command "heroku buildpacks:clear --app $heroku_app" "Clearing buildpacks" "true"
    run_command "heroku buildpacks:add heroku/nodejs --app $heroku_app" "Adding Node.js buildpack" "true"
    
    # Deploy to Heroku
    run_command "git push heroku main" "Deploying to Heroku"
    
    # Check deployment status
    print_color "$BLUE" "\n🔍 Checking deployment status..."
    run_command "heroku ps --app $heroku_app" "Checking app status" "true"
    
    # Open the deployed app
    print_color "$BLUE" "\n🌐 Opening deployed application..."
    run_command "heroku open --app $heroku_app" "Opening Heroku app" "true"
    
    print_color "$GREEN" "\n🎉 Deployment completed successfully!"
    print_color "$BLUE" "GitHub: https://github.com/netn10/Speed-Motioner"
    print_color "$BLUE" "Heroku: https://$heroku_app.herokuapp.com/"
}

# Error handling
set -e
trap 'print_color "$RED" "\n💥 Deployment failed with error: $?"; exit 1' ERR

# Run main function
main "$@"
