---
name: DevContainer Rebuild Preparation
description: Instructions for backing up and restoring global AI rules and settings (gemini.md, rules, workflows) before and after a DevContainer rebuild.
---

# DevContainer Rebuild Workflow

When the USER requests a DevContainer rebuild (or when you detect that a rebuild is necessary), you MUST follow these steps to ensure the USER's global AI instructions, rules, and workflows are not lost.

## Pre-Rebuild (Backup)
Before initiating or agreeing to a rebuild, you MUST copy the following files/folders from the container's ephemeral home directory to the persistent Workspace directory or the mounted ASSETS folder.

1. **Target Backup Location:** `/workspaces/Nodges/.agents/backup/` (Create this directory if it does not exist).
2. **Files to Backup:**
   - `/home/node/.gemini/GEMINI.md` (and any other `.md` files in `/home/node/.gemini/`)
   - Any global custom rules or workflows mentioned by the user that are currently outside of `/workspaces/Nodges/`.
3. **Action:** Use the `run_command` tool to `cp -r` these files to the backup location. Verify the files were copied.

## Post-Rebuild (Restore)
When waking up in a fresh DevContainer after a rebuild:

1. **Check for Backups:** Immediately check `/workspaces/Nodges/.agents/backup/`.
2. **Restore:** If files exist, copy them back to their appropriate locations (e.g., `/home/node/.gemini/GEMINI.md`).
3. **Cleanup:** Once successfully restored and verified, you may delete the backup folder.
4. **Context:** Read `/workspaces/Nodges/startup.md` to re-orient yourself to the project state.

**CRITICAL:** Never trigger a rebuild without performing the Pre-Rebuild backup first!
