---
name: ensure-browser-automation
description: Verify browser automation is available and start Chromium with remote debugging if needed. Enables browser_action tool to work in devcontainer environments. Use before web research tasks.
---

# Ensure Browser Automation

Verify browser automation is available and automatically start Chrome with remote debugging if needed. This enables the [`browser_action`](https://docs.roocode.com/advanced-usage/available-tools/browser-action) tool to work in devcontainer environments.

## When to Use

- Before using the `browser_action` tool for web research
- When browser_action fails with connection errors
- At the start of any workflow requiring web automation
- When instructed to research information from web sources

## Prerequisites

- Chrome/Chromium installed via Playwright (should be in devcontainer)
- Port 9222 available for remote debugging
- Access to `execute_command` tool
- Project's [`./do`](../../../do) script wrapper

## Procedure

### 1. Check if Chrome is Already Running

Use `execute_command` to check if Chrome is already available:

```bash
curl -s http://localhost:9222/json/version > /dev/null 2>&1 && echo "available" || echo "unavailable"
```

- If output is `"available"`, skip to step 3
- If output is `"unavailable"`, proceed to step 2

### 2. Start Chrome with Remote Debugging

If Chrome is not running, use the project's launch script:

```bash
./do launch-chromium-debug
```

**What this script does:**

- Finds the Chromium binary installed by Playwright
- Checks if port 9222 is already in use
- Starts Chromium in headless mode with remote debugging
- Runs in background and logs to `/tmp/chrome-debug.log`

**Expected output:**

- "Starting Chromium from: [path]" (if starting fresh)
- "Chromium is already running on port 9222." (if already running)

Wait 2-3 seconds for Chrome to initialize fully.

### 3. Use Browser Automation

- Proceed with [`browser_action`](https://docs.roocode.com/advanced-usage/available-tools/browser-action) tool
- Chrome will automatically be detected on port 9222
- Remember to close the browser session with `action: close` when done

## Validation Checklist

- [ ] Chrome is running with remote debugging on port 9222
- [ ] `curl http://localhost:9222/json/version` returns JSON response
- [ ] `browser_action` tool can successfully launch and navigate to URLs
- [ ] You are ready to perform web research or automation tasks

## Common Pitfalls

**Script fails with "Chromium not found"**

- **Cause**: Playwright hasn't installed browsers yet
- **Solution**: Run `./do bootstrap` to install all dependencies including browsers

**Port 9222 already in use**

- **Cause**: Another process is using the debugging port
- **Solution**: The script handles this - it will detect existing Chrome and skip launching

**Browser action still fails after launching Chrome**

- **Cause**: Chrome may not be fully initialized
- **Solution**: Wait 5 seconds and try again. Check logs: `tail -20 /tmp/chrome-debug.log`

**Chrome not responding**

- **Cause**: Chrome crashed or hung
- **Solution**: Kill the process and restart:
  ```bash
  pkill -f "chrome.*9222"
  ./do launch-chromium-debug
  ```

## Notes

- Chrome uses ~700-800MB RAM when active
- Chrome persists until manually killed or container restart
- Does not conflict with Playwright/Vitest browser tests (separate instances)
- Chrome can be safely left running for multiple browser automation tasks
- The script is idempotent - safe to run multiple times

## References

- [Browser Action Documentation](https://docs.roocode.com/advanced-usage/available-tools/browser-action)
- [Devcontainer Configuration](../../../.devcontainer/devcontainer.json)
- [Launch Script](../../../scripts/launch-chromium-debug)
