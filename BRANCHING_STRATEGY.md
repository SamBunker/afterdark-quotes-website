# Branching Strategy

This project uses a **dev → main** workflow with automatic deployments to separate environments.

## Branch Structure

### `main` Branch
- **Production environment**: `quotes.sambunker.com`
- Protected branch - requires pull requests for changes
- Automatically deploys to production on push
- Only accepts merges from `dev` branch via PR

### `dev` Branch
- **Development environment**: `devquotes.sambunker.com`
- Default working branch for all development
- Automatically deploys to dev environment on every commit/push
- Used for testing changes before production

## Workflow

### Making Changes

1. **Always work on the `dev` branch**:
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Make your changes and commit**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin dev
   ```

3. **Changes automatically deploy to `devquotes.sambunker.com`**

### Promoting to Production

1. **Test thoroughly on `devquotes.sambunker.com`**

2. **Create a Pull Request**:
   - Go to GitHub repository
   - Create PR from `dev` → `main`
   - Review changes
   - Get approval if needed

3. **Merge the PR**:
   - Merge `dev` into `main`
   - Changes automatically deploy to `quotes.sambunker.com`

4. **Keep `dev` updated** (if needed):
   ```bash
   git checkout dev
   git pull origin main
   git push origin dev
   ```

## CI/CD Pipeline

### On every push to `dev` or `main`:
1. Runs tests (syntax checks, linting)
2. If tests pass:
   - `dev` branch → triggers `deploy-dev` job → deploys to `devquotes.sambunker.com`
   - `main` branch → triggers `deploy-production` job → deploys to `quotes.sambunker.com`

### GitHub Secrets Required

- `PORTAINER_WEBHOOK_URL` - Production deployment webhook (quotes.sambunker.com)
- `PORTAINER_WEBHOOK_URL_DEV` - Dev deployment webhook (devquotes.sambunker.com)

## Branch Protection Rules (Recommended)

Configure in GitHub repository settings:

### For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches (optional)

### For `dev` branch:
- ✅ Require status checks to pass before merging (optional)
- No PR required - direct commits allowed

## Quick Reference

```bash
# Switch to dev branch
git checkout dev

# Get latest changes
git pull origin dev

# Make changes, then commit and push
git add .
git commit -m "Description of changes"
git push origin dev

# Create PR via GitHub web interface: dev → main

# After PR is merged, optionally sync dev with main
git checkout dev
git pull origin main
git push origin dev
```

## Environment URLs

- **Production**: https://quotes.sambunker.com (main branch)
- **Development**: https://dev-quotes.sambunker.com (dev branch)
