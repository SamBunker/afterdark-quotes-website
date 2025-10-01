
'

'

# GitHub Issue Processor

Process GitHub issues through a complete development workflow with AI-assisted planning, implementation, testing, and PR creation.

## Usage

```
/issue <issue_number> [OPTIONS]
```

## Description

This command processes a GitHub issue through the complete development workflow:

1. **📥 Fetch Issue Details** - Retrieves issue information from GitHub via URL
2. **🧠 AI Planning Phase** - Uses Claude for scratchpad-style breakdown  
3. **🌿 Create Feature Branch** - Sets up isolated development branch
4. **⚡ Implementation Guidance** - Provides AI-driven implementation steps
5. **🧪 Testing Phase** - Runs automated and guides manual testing
6. **💾 Commit Changes** - Uses custom /commit command or standard git
7. **📤 Create Pull Request** - Automated PR creation with issue linking
8. **✅ Close Issue** - Automatically closes the GitHub issue after successful implementation

## Options

- `--branch <name>` - Use custom branch name (default: auto-generated from issue)
- `--no-test` - Skip the testing phase entirely
- `--no-close` - Skip automatic issue closing (leave issue open)
- `--base <branch>` - Base branch for PR (default: main)
- `--help, -h` - Show detailed help information

## Examples

```bash
# Process issue #42 with default settings
/issue 42

# Use custom branch name
/issue 15 --branch fix-authentication-bug

# Skip tests and use develop as base branch
/issue 23 --no-test --base develop

# Process issue but leave it open for manual review
/issue 56 --no-close

# Get help
/issue --help
```

## Prerequisites

The following tools must be installed and configured:

- **Claude Code** - Must be installed and working with WebFetch capability

- **Git Repository** - Must be a GitHub-hosted repository with origin remote

- **Internet Connection** - Required for fetching issue data from GitHub URLs

## Workflow Details

### Step 1: Issue Analysis
- Detects current branch context for branch-specific issues
- Fetches complete issue details including title, body, labels, author, and state via GitHub URL
- Validates issue exists and is accessible through public GitHub interface
- Warns if issue is not in OPEN state but allows continuation

### Step 2: AI Planning Session
Initiates an interactive Claude Code session that provides:
- **📋 Analysis** - Understanding of what needs to be done
- **🔨 Breakdown** - Atomic, independent tasks
- **🔗 Dependencies** - Task dependency mapping
- **📅 Implementation Order** - Suggested sequence
- **🧪 Testing Strategy** - Testing recommendations
- **📁 Files to Modify** - Likely file changes
- **⚠️ Potential Risks** - Edge cases and risks
- **💡 Implementation Hints** - Specific approaches

### Step 3: Branch Management
- Works within current branch context (no branch switching for branch-specific issues)
- For branch-specific issues: implements changes in current branch
- For main branch issues: creates feature branch from current base branch
- Auto-generates branch names: `issue-{number}-{clean-title}` when creating new branches
- Handles branch naming conflicts gracefully

### Step 4: Implementation Guidance
Provides detailed implementation guidance including:
- **📁 New Files** - Files to create with structure
- **📝 File Modifications** - Specific changes needed
- **🔧 Code Changes** - Concrete code snippets
- **⚙️ Configuration** - Config file updates
- **🗄️ Database** - Schema changes if needed
- **📚 Documentation** - Documentation updates
- **🔍 Verification** - Change verification steps

### Step 5: Testing Phase (unless `--no-test`)
- **Automated Testing** - Detects and runs Maven, Gradle, or npm tests
- **Manual Testing Guidance** - AI-suggested test cases including:
  - Unit test recommendations
  - Integration scenarios
  - Manual test cases
  - Edge case testing
  - Regression verification
  - Performance considerations

### Step 6: Commit Process
- Stages all changes with `git add -A`
- Uses custom `/commit` command if available
- Falls back to standard git commit with auto-generated message
- Commit message format: `✨ feat: resolve issue #{number} - {title}`

### Step 7: Pull Request Creation
- Pushes feature branch to origin
- Creates PR with structured template including:
  - Issue summary and link
  - Implementation description
  - Testing checklist
  - Review notes section
  - Automatic issue closing reference

### Step 8: Issue Closure
- Provides instructions for manually closing the GitHub issue
- Suggests closure comment text linking to the implemented solution
- Recommends appropriate labels to mark issue as resolved
- Provides final status summary and next steps

### Step 9: Update Project Readme.MD file
- Update the project readme.md file, especially if the version changes.
- Document any changes and update the changelog

## Branch Naming Convention

Auto-generated branch names follow the pattern:
```
issue-{number}-{sanitized-title}
```

Examples:
- `issue-42-fix-authentication-bug`
- `issue-15-add-dark-mode-toggle`
- `issue-67-update-gradle-dependencies`

## Error Handling

The command includes comprehensive error handling:
- **Missing Dependencies** - Clear installation instructions
- **Repository Issues** - Validates GitHub repository
- **Issue Access** - Handles permissions and non-existent issues
- **Branch Conflicts** - Manages existing branches
- **Test Failures** - Stops on test failures with guidance
- **PR Creation** - Falls back to manual instructions

## Integration Points

- **Custom /commit Command** - Uses if available, falls back to git
- **Project Build Systems** - Auto-detects Maven, Gradle, or npm
- **GitHub URLs** - Direct web-based issue fetching without CLI dependency
- **Claude Code** - Interactive AI sessions for planning and implementation

## Output Format

The command provides colored, structured output:
- 🎯 **Purple** - Main process steps
- ✅ **Green** - Success messages and information
- ⚠️ **Yellow** - Warnings and prompts
- ❌ **Red** - Errors and failures
- ℹ️ **Cyan** - Informational messages
- 🔵 **Blue** - Step headers

## Repository Context

Automatically detects repository information:
- Extracts owner and repo name from git remote
- Works with both SSH and HTTPS GitHub URLs
- Validates GitHub hosting before proceeding

## Security Considerations

- Uses public GitHub URLs (no authentication required)
- Respects repository permissions through public access
- Only accesses publicly available issue information
- No sensitive data stored or transmitted

## Troubleshooting

**"Failed to fetch issue"**
- Check issue number exists
- Verify repository is publicly accessible
- Ensure internet connection is working
- Check if GitHub is accessible from your network

**"Missing required dependencies"**
- Install missing tools as listed in error message
- Ensure all tools are in PATH

**"Not in a git repository"**
- Must be run from within a git repository
- Repository must have GitHub origin remote

**"Tests failed"**
- Fix test failures before continuing
- Use `--no-test` to skip if necessary
- Check project-specific test commands

## Best Practices

1. **Review AI Planning** - Always review the scratchpad planning before implementation
2. **Manual Testing** - Complete suggested manual tests even with `--no-test`
3. **Branch Naming** - Use descriptive custom branch names for complex issues
4. **Base Branch** - Use appropriate base branch for your workflow
5. **Issue State** - Prefer processing OPEN issues
6. **Testing** - Don't skip tests unless absolutely necessary

This command streamlines the entire issue-to-PR workflow while maintaining quality through AI-assisted planning, implementation guidance, and comprehensive testing.
