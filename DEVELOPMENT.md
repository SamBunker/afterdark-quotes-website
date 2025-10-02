# Development Guide

This project has three environments: **Production**, **Dev**, and **Local**.

---

## Environments

### 1. **Production** (`main` branch)
- **URL**: https://quotes.sambunker.com
- **Port**: 3001
- **Environment**: `.env` with `PORT=3001`
- **Deployment**: Automatic via GitHub Actions when pushed to `main`
- **Access**: Password-protected (see `.env`)

### 2. **Dev** (`dev` branch)
- **URL**: https://devquotes.sambunker.com
- **Port**: 3002
- **Environment**: `.env` with `PORT=3002`
- **Deployment**: Automatic via GitHub Actions when pushed to `dev`
- **Access**: Password-protected (see `.env`)

### 3. **Local** (Your machine)
- **URL**: http://localhost:3003
- **Port**: 3003
- **Environment**: `.env.local` with `PORT=3003`
- **Deployment**: Manual Docker command
- **Access**: Direct access via localhost

---

## Running Locally

### Option 1: Native Node.js (Recommended - Fast & Auto-reload)

**First time setup:**
```cmd
npm install --legacy-peer-deps
```

**Run with auto-reload (detects file changes):**
```cmd
run-local-nodemon.bat
```

**Run without auto-reload:**
```cmd
run-local-simple.bat
```

**Benefits:**
- ✅ **Instant updates** - Changes reflect immediately
- ✅ **Auto-reload** - Nodemon restarts on file changes (with nodemon version)
- ✅ **Faster startup** - No Docker overhead
- ✅ **Direct debugging** - Easier to debug with IDE

---

### Option 2: Docker (Isolated Environment)

**Quick Start:**
```cmd
run-local.bat
```

**Manual Docker Command:**
```bash
docker run --rm --name afterdark-quotes-local -v "D:/Development Projects/afterdark-quotes-website/:/app" -w /app -p 3003:3003 --env-file .env.local node:18-slim bash -c "npm install --legacy-peer-deps && node app.js"
```

**What This Does:**
1. **Stops existing container** (if running)
2. **Mounts your local directory** to `/app` in the container
3. **Installs dependencies** with `npm install --legacy-peer-deps`
4. **Runs the app** with `node app.js`
5. **Uses `.env.local`** for environment variables
6. **Maps port 3003** from container to host
7. **Auto-removes** container on stop (`--rm` flag)

**Benefits:**
- ✅ **Isolated environment** - Same as production
- ✅ **No local Node.js needed** - Everything in Docker

**Drawbacks:**
- ❌ **Slower startup** - Docker overhead
- ❌ **No auto-reload** - Must restart container manually to see changes

---

### Access:

Once running (either method), visit: **http://localhost:3003**

### To See Changes:

**With nodemon (Option 1):**
- Just save your file - auto-reloads automatically

**With Docker (Option 2):**
- Stop container (Ctrl+C)
- Run `run-local.bat` again

**With simple Node (Option 1):**
- Stop server (Ctrl+C)
- Run `run-local-simple.bat` again

---

## Environment Files

### `.env` (Production/Dev)
- Used by deployed environments
- Contains production/dev passwords and ports
- **Do not commit to git** (already in `.gitignore`)

### `.env.local` (Local Development)
- Used for local Docker development
- Port 3003
- Same AWS credentials as other environments
- **Do not commit to git** (add to `.gitignore`)

---

## Development Workflow

### Making Changes:

1. **Work on `dev` branch**:
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Test locally** using `run-local.bat` or Docker command

3. **Commit and push** to `dev`:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin dev
   ```

4. **Test on dev environment**: https://devquotes.sambunker.com

5. **Create PR** when ready for production: `dev` → `main`

6. **Merge PR** to deploy to production

---

## Port Reference

| Environment | Port | URL |
|-------------|------|-----|
| Production  | 3001 | https://quotes.sambunker.com |
| Dev         | 3002 | https://devquotes.sambunker.com |
| Local       | 3003 | http://localhost:3003 |

---

## Troubleshooting

### Port Already in Use:
```bash
# Windows: Find process using port 3003
netstat -ano | findstr :3003

# Kill process by PID
taskkill /PID <PID> /F
```

### Docker Container Won't Start:
```bash
# Check running containers
docker ps

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -a -q)
```

### Changes Not Reflecting:
- Stop the Docker container (Ctrl+C)
- Run the command again
- Docker mounts your local files, so changes should appear immediately

### Permission Errors:
- Make sure Docker Desktop is running
- Run command prompt as Administrator

---

## Quick Commands

```bash
# Start local development
run-local.bat

# Check what's running on port 3003
netstat -ano | findstr :3003

# View Docker logs
docker logs <container-id>

# Stop Docker container
docker stop <container-id>
```

---

**Happy Coding!** 🚀
