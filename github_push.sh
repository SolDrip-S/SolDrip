#!/bin/bash
# Script to push SolDrip codebase to GitHub

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SolDrip GitHub Push Tool ===${NC}"
echo

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Verify we're in the right directory
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}This doesn't appear to be a git repository.${NC}"
    echo "Please run this script from the root of your SolDrip project."
    exit 1
fi

# Verify remote origin is set correctly
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
EXPECTED_URL="https://github.com/SolDrip-S/SolDrip.git"

if [ "$REMOTE_URL" != "$EXPECTED_URL" ]; then
    echo -e "${YELLOW}Remote URL is not set to SolDrip repository.${NC}"
    echo -e "Current remote: ${REMOTE_URL:-None}"
    echo -e "Setting remote to ${EXPECTED_URL}..."
    git remote remove origin 2>/dev/null
    git remote add origin "$EXPECTED_URL"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Currently on branch '$CURRENT_BRANCH' instead of 'main'.${NC}"
    read -p "Do you want to switch to 'main' branch? (y/n): " SWITCH_BRANCH
    if [[ $SWITCH_BRANCH == "y" || $SWITCH_BRANCH == "Y" ]]; then
        git checkout -b main 2>/dev/null || git checkout main
    fi
fi

# Check for changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}You have uncommitted changes.${NC}"
    read -p "Do you want to commit them? (y/n): " COMMIT_CHANGES
    if [[ $COMMIT_CHANGES == "y" || $COMMIT_CHANGES == "Y" ]]; then
        git add .
        read -p "Enter commit message [SolDrip update]: " COMMIT_MSG
        COMMIT_MSG=${COMMIT_MSG:-"SolDrip update"}
        git commit -m "$COMMIT_MSG"
    fi
fi

# Authentication options
echo
echo -e "${BLUE}=== Authentication Options ===${NC}"
echo "1. Use HTTPS with username/password or token"
echo "2. Switch to SSH (recommended for regular use)"
read -p "Select an option (1/2): " AUTH_OPTION

if [ "$AUTH_OPTION" == "2" ]; then
    # Set up SSH
    echo
    echo -e "${BLUE}=== Setting up SSH ===${NC}"
    
    # Check if SSH key exists
    if [ ! -f ~/.ssh/id_ed25519.pub ]; then
        echo "Creating a new SSH key..."
        ssh-keygen -t ed25519 -C "soldrip@163.com"
    fi
    
    # Display public key
    echo
    echo -e "${YELLOW}Copy this SSH public key to your GitHub account:${NC}"
    echo "https://github.com/settings/ssh/new"
    echo
    cat ~/.ssh/id_ed25519.pub
    echo
    
    # Change remote URL to SSH
    git remote set-url origin git@github.com:SolDrip-S/SolDrip.git
    echo "Remote URL changed to use SSH."
    
    read -p "Press Enter once you've added the SSH key to your GitHub account..."
    
    # Test SSH connection
    echo "Testing SSH connection to GitHub..."
    ssh -T git@github.com
else
    # Use HTTPS
    echo
    echo -e "${YELLOW}You'll need to enter your GitHub username and password or personal access token.${NC}"
    echo "If using a password doesn't work, create a personal access token at:"
    echo "https://github.com/settings/tokens/new"
    echo
fi

# Push to GitHub
echo
echo -e "${BLUE}=== Pushing to GitHub ===${NC}"
echo "Pushing to GitHub repository..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo "Repository URL: https://github.com/SolDrip-S/SolDrip"
else
    echo
    echo -e "${YELLOW}Push failed. Please check the error message above.${NC}"
fi 