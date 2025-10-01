# Discord Token-Based Authentication Migration

## ✅ Migration Complete

This document summarizes the migration from password-based authentication to Discord token-based authentication.

---

## Changes Made

### 1. **Website Changes** (afterdark-quotes-website)

#### Updated Files:
- **dynamo.js**
  - Changed token expiry from 1 hour → **8 hours** (line 254)

- **app.js**
  - Removed `isPasswordValid()` middleware
  - Removed `/password` GET/POST routes
  - Removed `/identity` GET/POST routes
  - Added `requireAuth()` middleware (replaces both old middlewares)
  - Added `/unauthorized` route for non-authenticated users
  - Updated `/reset` to redirect to `/unauthorized`
  - Updated home route `/` to check authentication and redirect unauthorized users
  - Kept `/auth/:token` route (already functional)
  - Applied `requireAuth` middleware to protected routes: `/rate`, `/limbo`, `/quote/:id` POST, `/logout`
  - Removed authentication from public routes: `/leaderboard`, `/quote/:message_id` GET

- **.env**
  - Removed `SITE_PASSWORD` variable

#### Deleted Files:
- `views/password.handlebars`
- `views/identity.handlebars`

#### New Files:
- `views/unauthorized.handlebars` - Beautiful access restriction page with instructions

---

### 2. **Discord Bot Changes** (afterdark-quotes-bot)

#### Updated Files:
- **main.py**
  - Changed from `discord.Client` → `discord.Bot` (line 34) to support slash commands
  - Added imports: `uuid`, `datetime`, `timedelta`
  - Added `/quotes` slash command (lines 79-123):
    - Generates unique UUID token
    - Stores in DynamoDB with 8-hour expiry
    - Sends ephemeral message with embedded link
    - Single-use token validation
  - Updated version to 2.0.0
  - Kept existing message monitoring functionality

---

## How It Works

### User Flow:

1. **User visits website directly** → Redirected to `/unauthorized` page
2. **User runs `/quotes` in Discord** → Bot generates token and sends private link
3. **User clicks link** → Website validates token via `/auth/:token`
4. **Token valid** → Session created, user redirected to `/rate`
5. **User can now access** all protected routes for the session duration
6. **Token expires** → User must request new `/quotes` link

### Token Security:
- ✅ 8-hour expiration
- ✅ Single-use (marked as used after first authentication)
- ✅ Unique UUID v4 tokens
- ✅ Linked to Discord user ID
- ✅ Stored in DynamoDB `afterdark-auth-tokens` table

---

## Protected vs Public Routes

### Protected Routes (require authentication):
- `/` - Home page
- `/rate` - Rate quotes
- `/limbo` - Admin quote approval
- `/logout` - Logout
- `/reset` - Session reset
- `POST /quote/:id` - Submit ratings/approvals

### Public Routes (no authentication):
- `/unauthorized` - Access restriction page
- `/auth/:token` - Token validation and login
- `/leaderboard` - View all quotes
- `GET /quote/:message_id` - View individual quote details

---

## Testing Checklist

Before deploying to production, test:

- [ ] Direct website access → redirects to `/unauthorized`
- [ ] `/quotes` command in Discord → receives ephemeral message with link
- [ ] Click auth link → creates session and redirects to `/rate`
- [ ] Can rate quotes without visiting `/identity`
- [ ] Token used twice → shows error page
- [ ] Token expires after 8 hours → shows error page
- [ ] `/reset` clears session → redirects to `/unauthorized`
- [ ] Public routes (leaderboard, quote details) work without auth
- [ ] Protected routes redirect to `/unauthorized` when not authenticated

---

## Environment Variables Required

### Website (.env):
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-2
PORT=3001
```

### Discord Bot (.env):
```
TOKEN=...
CHANNEL_ID=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-2
DYNAMO_TABLE=limbo-afterdark-quotes-updated
AUTH_TOKENS_TABLE=afterdark-auth-tokens
WEBSITE_URL=https://quotes.sambunker.com
```

---

## AWS DynamoDB Configuration

### Enable TTL (Optional but Recommended):

1. Go to AWS Console → DynamoDB → Tables
2. Select `afterdark-auth-tokens`
3. **Additional settings** → **Time to Live (TTL)**
4. Enable TTL on attribute: `expires_at`
5. Convert timestamps to Unix epoch for TTL to work properly

This will auto-delete expired tokens within 48 hours of expiration.

---

## Future Enhancements

### Admin Panel for User Access Control:
- Add `disabled` field to auth tokens or create separate user access control table
- Create admin routes to enable/disable user access
- Update `/auth/:token` to check if user is disabled
- Add admin dashboard to manage user permissions

### Deprecated Tables:
- **`afterdark_quotes_members`** - No longer used. User information (discord_id, username, display_name) is now stored directly in the auth tokens table when users request access via `/quotes` command. See [MEMBERS_TABLE_DEPRECATION.md](MEMBERS_TABLE_DEPRECATION.md) for details.

---

## Deployment Notes

1. **Deploy website first** (ensure `/auth/:token` route works)
2. **Deploy Discord bot** with updated code
3. **Test end-to-end** flow before announcing to users
4. **Update documentation** for users on how to use `/quotes` command
5. **Consider**: Pin message in Discord explaining new authentication method

---

## Rollback Plan

If issues occur:

1. Revert `app.js` to previous commit
2. Restore `password.handlebars` and `identity.handlebars`
3. Add back `SITE_PASSWORD` to `.env`
4. Revert Discord bot to Client-based implementation

---

## Migration Date

**Completed**: [Current Date]

**Migration Version**: Website v2.0, Discord Bot v2.0.0

---

🎭 After Dark Quotes - Now with Discord Authentication!
