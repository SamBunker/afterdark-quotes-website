# Git Review and Commit : AI-Powered Code Review with Well Formatted Commits
This command performs an AI code review using Claude Code and then creates well-formatted commits with conventional commit messages and emoji.

## Usage
To review and commit, just type:
```
/review-and-commit
```
Or with options:
```
/review-and-commit --no-verify
```

## What This Command Does
1. Unless specified with `--no-verify`, ALWAYS runs pre-commit checks:
    - any possible linting to ensure code quality
    - any possible build to verify the build succeeds
    - any possible documentation generation to update documentation
2. Checks which files are staged with `git status`
3. Automatically adds all modified and new files with `git add`
4. Performs a `git diff` to understand what changes are being committed
5. **NEW**: Performs AI code review using Claude Code on all files in `/src/`:
    - Reviews code quality and best practices
    - Identifies potential bugs or security issues
    - Checks performance considerations
    - Validates adherence to language/framework conventions
    - Analyzes file structure and organization
6. **NEW**: Prompts for approval after each file review (y/n/s to skip)
7. **NEW**: Allows aborting the commit process if issues are found during review
8. Analyzes the diff to determine if multiple distinct logical changes are present
9. Creates a commit message using emoji conventional commit format
10. **NEW**: Executes the commit automatically after successful review

## AI Code Review Process
- Reviews all files in `/src/` directory that are staged for commit
- Provides detailed feedback on each file
- Supports multiple file types (Java, XML, properties, YAML, JSON, etc.)
- Interactive approval process for each reviewed file
- Option to skip files or abort entire commit if issues found

## Best Practices for Review and Commits
- **AI-First Review**: Let Claude Code catch issues before they reach your repository
- **Interactive Approval**: Review Claude's feedback and decide whether to proceed
- **Verify before committing**: Ensure code is linted, builds correctly, and documentation is updated. Make sure to run ALL of the pre-commit checks first.
- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Address AI feedback**: Consider Claude's suggestions before proceeding with commit
- **Conventional commit format**: Use the format `<type>: <description>` where type is one of:
    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation changes
    - `style`: Code style changes (formatting, etc)
    - `refactor`: Code changes that neither fix bugs nor add features
    - `perf`: Performance improvements
    - `test`: Adding or fixing tests
    - `chore`: Changes to the build process, tools, etc.
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "add feature" not "added feature")
- **Concise first line**: Keep the first line under 72 characters
- **Emoji**: Each commit type is paired with an appropriate emoji:
    - ✨ `feat`: New feature
    - 🐛 `fix`: Bug fix
    - 📝 `docs`: Documentation
    - 💄 `style`: Formatting/style
    - ♻️ `refactor`: Code refactoring
    - ⚡️ `perf`: Performance improvements
    - ✅ `test`: Tests
    - 🔧 `chore`: Tooling, configuration
    - 🚀 `ci`: CI/CD improvements
    - 🗑️ `revert`: Reverting changes
    - 🧪 `test`: Add a failing test
    - 🚨 `fix`: Fix compiler/linter warnings
    - 🔒️ `fix`: Fix security issues
    - 👥 `chore`: Add or update contributors
    - 🚚 `refactor`: Move or rename resources
    - 🏗️ `refactor`: Make architectural changes
    - 🔀 `chore`: Merge branches
    - 📦️ `chore`: Add or update compiled files or packages
    - ➕ `chore`: Add a dependency
    - ➖ `chore`: Remove a dependency
    - 🌱 `chore`: Add or update seed files
    - 🧑‍💻 `chore`: Improve developer experience
    - 🧵 `feat`: Add or update code related to multithreading or concurrency

## Implementation Script
```bash
#!/bin/bash

# /review-and-commit implementation
function review-and-commit() {
    local no_verify=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-verify)
                no_verify=true
                shift
                ;;
            *)
                echo "Unknown option: $1"
                return 1
                ;;
        esac
    done
    
    echo "🤖 Starting AI-powered review and commit process..."
    
    # Run pre-commit checks unless --no-verify is specified
    if [ "$no_verify" = false ]; then
        echo "🔍 Running pre-commit checks..."
        # Add your linting, build, and documentation generation commands here
        # Example:
        # mvn clean compile
        # npm run lint
        # make docs
    fi
    
    # Check git status
    echo "📋 Checking git status..."
    git status
    
    # Add all modified and new files
    echo "➕ Adding all modified and new files..."
    git add .
    
    # Get staged files in /src/
    SRC_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '^src/')
    
    if [ -z "$SRC_FILES" ]; then
        echo "📁 No files in /src/ to review."
    else
        echo "🔍 AI Code Review - Reviewing files in /src/:"
        echo "$SRC_FILES"
        
        # Review each file in src/
        for file in $SRC_FILES; do
            echo "🤖 Reviewing $file..."
            
            # Get file extension for context
            EXTENSION="${file##*.}"
            
            claude-code "Please review this source file for:
            - Code quality and best practices
            - Potential bugs or security issues
            - Performance considerations
            - Adherence to language/framework conventions
            - File structure and organization
            
            File: $file (.$EXTENSION file)
            $(cat $file)"
            
            read -p "✅ Continue with commit for $file? (y/n/s to skip): " choice
            case $choice in
                y|Y ) continue ;;
                s|S ) continue ;;
                * ) echo "❌ Commit aborted due to review feedback."; return 1 ;;
            esac
        done
        
        echo "✅ All files reviewed successfully!"
    fi
    
    # Get diff for commit message analysis
    echo "📝 Analyzing changes for commit message..."
    git diff --cached
    
    # Create commit message (you would implement your existing logic here)
    echo "💬 Creating conventional commit message..."
    
    # This is where you'd add your existing commit message generation logic
    # For now, prompting user for commit message
    read -p "📝 Enter commit message (will be formatted with emoji): " commit_msg
    
    # Commit the changes
    if [ "$no_verify" = true ]; then
        git commit --no-verify -m "$commit_msg"
    else
        git commit -m "$commit_msg"
    fi
    
    echo "🎉 Review and commit completed successfully!"
}

# Make the function available
alias review-and-commit='review-and-commit'
```

## Key Differences from /commit
- **AI Code Review**: Integrated Claude Code review before committing
- **Interactive Process**: User approval required after each file review
- **Abort Capability**: Can stop the entire process if issues are found
- **Comprehensive Coverage**: Reviews all file types in `/src/`, not just specific extensions
- **Enhanced Feedback**: Provides detailed analysis of code quality, security, and performance

## Setup Requirements
1. Claude Code must be installed and available in your PATH
2. The command should be added to your shell profile (`.bashrc`, `.zshrc`, etc.)
3. Your git repository should have the `/src/` directory structure
