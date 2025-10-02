# Members Table Deprecation Notice

## ⚠️ `afterdark_quotes_members` Table is Now Deprecated

As of the Discord Token-Based Authentication migration, the `afterdark_quotes_members` table is **no longer used** by the application.

---

## Why Deprecated?

Previously, the application required a pre-populated list of members in the `afterdark_quotes_members` table to:
1. Display user selection on `/identity` page
2. Validate that users existed in the system
3. Get user nicknames for session creation

With Discord authentication, user information is now obtained **directly from Discord** when they use the `/quotes` slash command.

---

## New User Data Flow

### Before (Old System):
1. User visits `/identity`
2. Website queries `afterdark_quotes_members` table
3. Displays list of pre-registered members
4. User selects their identity
5. Session created with `discord_id` and `nickname` from members table

### After (New System):
1. User runs `/quotes` in Discord
2. Bot gets user info from Discord API:
   - `discord_id` (User ID)
   - `username` (Discord username)
   - `display_name` (Server nickname or username)
3. Bot stores this info in `afterdark-auth-tokens` table with token
4. User clicks auth link
5. Website reads user info from auth token
6. Session created with data from token

---

## Schema Changes

### `afterdark-auth-tokens` Table Now Includes:

| Field | Type | Description |
|-------|------|-------------|
| `token` | String | UUID v4 token (Partition Key) |
| `discord_id` | String | User's Discord ID |
| `username` | String | Discord username |
| `display_name` | String | Server nickname (if set) or username |
| `created_at` | String | ISO timestamp |
| `expires_at` | String | ISO timestamp (8 hours from creation) |
| `used` | Boolean | Whether token has been used |

---

## Code Changes Made

### Removed:
- `MEMBER_TABLE` constant from `dynamo.js`
- `getUsers()` function from `dynamo.js`
- Import of `getUsers` in `app.js`
- Lookup of user in members table during `/auth/:token` flow

### Modified:
- **Discord Bot**: Now captures and stores `username` and `display_name` in auth token
- **Website**: Gets user info from token data instead of querying members table
- **Session**: Uses `display_name` (or falls back to `username`) as nickname

---

## Migration Impact

### ✅ No Action Required If:
- You are using Discord authentication (`/quotes` command)
- Users authenticate via `/auth/:token` route

### ⚠️ Action Required If:
- You have custom scripts that depend on `afterdark_quotes_members` table
- You need to maintain a list of authorized users outside of Discord

---

## Can I Delete the Table?

**Recommendation**: Keep the table for now as a backup/reference, but it's safe to delete after confirming:

1. ✅ Discord bot is deployed with updated code
2. ✅ All users successfully authenticate via `/quotes` command
3. ✅ No errors in application logs related to missing user data
4. ✅ No custom integrations depend on the table

**Grace Period**: Consider keeping for 30 days post-migration, then delete if no issues arise.

---

## Rollback Plan

If you need to revert to the old system:

1. Restore `MEMBER_TABLE` constant in `dynamo.js`
2. Restore `getUsers()` function
3. Restore member table lookup in `/auth/:token`
4. Re-enable `/identity` route
5. Redeploy application

---

## Benefits of This Change

✅ **Dynamic User Management**: No need to pre-populate member list
✅ **Always Up-to-Date**: User info comes directly from Discord
✅ **Server Nicknames**: Automatically uses server nickname if set
✅ **Reduced Maintenance**: One less table to maintain
✅ **Simplified Code**: Removed unnecessary database queries

---

## Questions?

If you have concerns about this deprecation or need to maintain member list functionality for other reasons, consider:

1. Creating a separate admin panel with user access control
2. Implementing a whitelist/blacklist system in a new table
3. Using Discord role-based access control

---

**Deprecated Date**: [Current Date]
**Fully Removable After**: [Date + 30 days]
