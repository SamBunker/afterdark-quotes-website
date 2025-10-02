# Port Configuration Guide

The `docker-compose.yml` file now uses environment variables for port configuration, allowing the same file to work across all environments.

## How It Works

### docker-compose.yml
```yaml
ports:
  - "${HOST_PORT:-3001}:${CONTAINER_PORT:-3001}"
```

This means:
- **HOST_PORT**: The port on the host machine (defaults to 3001 if not set)
- **CONTAINER_PORT**: The port inside the container (defaults to 3001 if not set)
- The `:-3001` syntax provides a default value

---

## Environment-Specific Configuration

### Production (main branch)
**In Portainer Environment Variables:**
```
PORT=3001
HOST_PORT=3001
CONTAINER_PORT=3001
```

**Result:** `3001:3001` - Host port 3001 maps to container port 3001

---

### Dev (dev branch)
**In Portainer Environment Variables:**
```
PORT=3002
HOST_PORT=3002
CONTAINER_PORT=3002
```

**Result:** `3002:3002` - Host port 3002 maps to container port 3002

---

### Local (your machine)
**In `.env.local`:**
```
PORT=3003
HOST_PORT=3003
CONTAINER_PORT=3003
```

**Result:** `3003:3003` - Host port 3003 maps to container port 3003

---

## Benefits

✅ **Single docker-compose.yml** works for all environments
✅ **No merge conflicts** between branches
✅ **Environment-specific** configuration via Portainer/env files
✅ **Default values** if variables not set (3001:3001)

---

## Setup in Portainer

When creating/updating your Portainer stacks:

### Production Stack:
1. Go to Portainer → Stacks → `afterdark-quotes-production`
2. Scroll to **Environment variables**
3. Add/Update:
   - `HOST_PORT` = `3001`
   - `CONTAINER_PORT` = `3001`
   - `PORT` = `3001`

### Dev Stack:
1. Go to Portainer → Stacks → `afterdark-quotes-dev`
2. Scroll to **Environment variables**
3. Add/Update:
   - `HOST_PORT` = `3002`
   - `CONTAINER_PORT` = `3002`
   - `PORT` = `3002`

---

## Migration Notes

### What Changed:
- **Before**: `ports: - "3002:3001"` (hardcoded in dev)
- **After**: `ports: - "${HOST_PORT:-3001}:${CONTAINER_PORT:-3001}"` (dynamic)

### Action Required:
1. ✅ Update Portainer environment variables (see above)
2. ✅ Redeploy stacks after adding variables
3. ✅ Verify ports are correctly mapped

---

## Troubleshooting

### Port Already in Use:
```bash
# Check what's using the port
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Container Not Starting:
- Check Portainer logs
- Verify environment variables are set
- Ensure no other container is using the same HOST_PORT

---

**No more merge conflicts between dev and main!** 🎉
