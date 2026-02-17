# Feature Specification: Notification Display System

**Status:** Draft  
**Target Mode:** Code  
**Created:** 2026-02-04

## Overview

**What:** Visual notification/toast component that displays user feedback messages from the existing [`useNotifications`](../../../src/composables/useNotifications.ts:59) context.

**Why:** Users currently have no visual feedback when important operations complete or fail (project creation, deletion, file operations, etc.). Notifications are triggered in code but never displayed, creating a confusing experience where actions appear to silently succeed or fail.

**Who:** All users across both the home page (project management) and writing project pages (canvas and sidebar editing).

**Success Criteria:**

- Users see confirmation when projects are created, deleted, or saved
- Users see clear error messages when operations fail
- Notifications don't interfere with canvas, sidebar, or other UI elements
- Multiple simultaneous notifications are clearly visible and manageable

## Architectural Decisions

### Decision 1: Global Component in App.vue

**Choice:** Place notification container in [`App.vue`](../../../src/App.vue:1) at app root level.

**Rationale:**

- Notifications persist across route navigation (e.g., "Project created" success message remains visible while navigating from home → writing project)
- Aligns with existing architecture where `provideNotifications` would naturally live at app root
- Single source of truth for all notifications app-wide
- Simpler than managing separate notification containers per page

**Tradeoff:** Cannot have page-specific notification styling/positioning, but this isn't needed for the use cases identified.

### Decision 2: Top-Right Fixed Position

**Choice:** Fixed position in top-right corner of viewport (classic toast position).

**Rationale:**

- Stays out of the way of primary UI elements (canvas controls, sidebar, header)
- Industry standard position (GitHub, VS Code, Vercel) - users are familiar with the pattern
- Doesn't interfere with any page-specific UI based on current layouts
- Works consistently across both home page and writing project page

**Alternatives Considered:**

- Top-center: Would overlap with potential future header elements
- Bottom positions: Less noticeable, users might miss important errors

### Decision 3: Vertical Stacking with Newest at Top

**Choice:** Multiple notifications stack vertically downward from the top-right anchor point, with newest notifications appearing at the top.

**Rationale:**

- Users naturally scan top-to-bottom, so most recent (most relevant) notification is where eyes land first
- Older notifications gracefully slide down as new ones appear
- Aligns with best practices (macOS, GitHub, VS Code, Vercel)
- Natural fit with auto-dismiss behavior (older notifications disappear from bottom)

**Expected Volume:** Based on current usage patterns, rarely more than 1-2 simultaneous notifications. System should handle up to 5 gracefully.

### Decision 4: Graduated Auto-Dismiss Timing

**Choice:** Default auto-dismiss durations based on notification type:

- **Success:** 4 seconds (quick confirmation)
- **Warning:** 6 seconds (needs more attention)
- **Error:** 8 seconds (critical, needs reading time)

**Rationale:**

- More critical messages get more time to be read
- 4-8 second range is standard in UX research for reading short messages
- Provides sensible defaults while allowing explicit duration overrides in code

**Implementation Note:** Update [`useNotifications.ts`](../../../src/composables/useNotifications.ts:1) helper methods (`success`, `error`, `warning`) to apply these defaults when duration is not explicitly provided.

### Decision 5: Both Auto-Dismiss and Manual Close

**Choice:** Include close button (X) on each notification while also auto-dismissing after duration.

**Rationale:**

- Gives users control to immediately dismiss notifications they've read
- Auto-dismiss prevents notification buildup without user intervention
- Best of both worlds: convenience + control
- Standard pattern in modern apps

## Functional Requirements

### FR1: Notification Display Component

Create a new component `AppNotificationContainer.vue` in `src/features/common/` that:

- Consumes notifications from [`useNotifications()`](../../../src/composables/useNotifications.ts:59)
- Renders each notification as a dismissible card
- Positions container at top-right of viewport (fixed position)
- Stacks notifications vertically with newest at top

### FR2: Individual Notification Card

Each notification card must:

- Display the notification message text
- Show appropriate visual indicator for type (success/warning/error)
- Include a close button (X icon)
- Trigger `remove(notification)` when close button clicked
- Follow app's design system (paper/ink theme, existing typography)

### FR3: Animations

**Entry Animation:**

- Slide in from right side (translate X from 100% to 0)
- Fade in simultaneously (opacity 0 to 1)
- Duration: ~300ms with ease-out timing

**Exit Animation:**

- Fade out (opacity 1 to 0)
- Duration: ~200ms
- Triggered on: manual dismiss or auto-dismiss

**Stacking Animation:**

- When new notification appears, existing notifications smoothly slide down
- Use Vue's `<TransitionGroup>` for list animations

### FR4: Auto-Dismiss Integration

- Apply default durations in [`useNotifications.ts`](../../../src/composables/useNotifications.ts:1) helper methods
- Ensure existing behavior (passing `duration` triggers setTimeout) continues to work
- Success/Warning/Error helpers should apply 4s/6s/8s defaults respectively

### FR5: Responsive Behavior

- Maintain top-right position on all screen sizes
- On mobile (< 640px): Notifications should have appropriate padding from screen edges
- Maximum notification width: ~400px to prevent overly wide messages

## Edge Cases and Error Handling

### EC1: Many Simultaneous Notifications

**Scenario:** 5+ notifications appear rapidly (e.g., multiple errors during batch operation).

**Behavior:**

- Stack up to 5 notifications
- If more than 5 exist, show only the 5 most recent
- Older notifications still in queue are dismissed automatically
- No need to scroll or complex overflow handling

### EC2: Very Long Message Text

**Scenario:** Error message contains detailed technical information spanning multiple lines.

**Behavior:**

- Notification card expands vertically to fit content
- Apply reasonable max-height (e.g., 200px) with scroll if exceeded
- Truncation not required - errors need full visibility

### EC3: Navigation During Active Notifications

**Scenario:** User navigates from home → writing project while notification is visible.

**Behavior:**

- Notification remains visible and continues its auto-dismiss timer
- This is intentional (architectural decision to use global container)
- Example: "Project created" success message stays visible during navigation

### EC4: Rapid Dismiss Actions

**Scenario:** User rapidly clicks close buttons on multiple notifications.

**Behavior:**

- Each click immediately removes corresponding notification
- Remaining notifications smoothly animate to fill space
- No race conditions with auto-dismiss timers

## UI Flows

### Flow 1: Project Deletion Success

1. User clicks delete on project in home page
2. [`ProjectListItem.vue`](../../../src/features/home/components/ProjectListItem.vue:1) calls `success('Project deleted')`
3. Notification slides in from right at top-right position
4. After 4 seconds, notification fades out and is removed
5. User can click X to dismiss earlier if desired

### Flow 2: Project Creation Error

1. User attempts to create project with invalid name
2. [`HomePage.vue`](../../../src/features/home/HomePage.vue:1) calls `error('Failed to create project')`
3. Notification slides in from right, styled for error type
4. Error notification remains visible for 8 seconds
5. User reads message and manually dismisses with X button

### Flow 3: Multiple Operations

1. User creates new project → Success notification appears
2. During navigation, creation success still visible
3. User immediately deletes a different project → Second success notification appears above first
4. First notification auto-dismisses after 4s total
5. Second notification continues its own 4s timer

## Data Models

No new data models required. Uses existing `AppNotification` type from [`useNotifications.ts`](../../../src/composables/useNotifications.ts:13):

```typescript
type AppNotification = {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
  duration?: number
}
```

## Out of Scope

The following are explicitly NOT part of this feature:

- **Custom notification layouts:** No support for rich content, action buttons, or custom HTML in notifications
- **Notification history:** No persistent log of past notifications
- **"Info" type notifications:** Only success/warning/error supported (matches existing API)
- **Grouped notifications:** No "3 projects deleted" batching/grouping
- **Sound effects:** Visual feedback only
- **Dark mode variations:** Follow existing theme system, no notification-specific dark mode logic
- **Per-page notification containers:** Global container only
- **Notification center/panel:** No persistent UI showing past notifications

## Acceptance Criteria

Implementation is complete when:

- [ ] New `AppNotificationContainer.vue` component created in `src/features/common/`
- [ ] Component imported and rendered in [`App.vue`](../../../src/App.vue:1)
- [ ] `provideNotifications()` called in [`App.vue`](../../../src/App.vue:1) if not already present
- [ ] Notifications appear in top-right corner with proper fixed positioning
- [ ] Success notifications auto-dismiss after 4 seconds
- [ ] Warning notifications auto-dismiss after 6 seconds
- [ ] Error notifications auto-dismiss after 8 seconds
- [ ] Each notification shows a close button that immediately dismisses it
- [ ] Multiple notifications stack vertically with newest at top
- [ ] Entry animation: slide in from right + fade in (~300ms)
- [ ] Exit animation: fade out (~200ms)
- [ ] Notifications persist across route navigation (home ↔ writing project)
- [ ] Manual testing: delete project on home page shows success notification
- [ ] Manual testing: trigger error state shows error notification with 8s duration
- [ ] Storybook story created showing all three notification types
- [ ] Component works on mobile viewports (< 640px) with appropriate spacing

## Implementation Notes

### Icon System

Icons needed for notifications:

- Success: Consider checkmark/check-circle icon
- Warning: Use existing [`warning`](../../../src/features/common/icons.ts:12) icon
- Error: Consider X-circle or warning-circle icon
- Close button: Use existing [`delete`](../../../src/features/common/icons.ts:11) icon (IPhX)

Add new icons to [`src/features/common/icons.ts`](../../../src/features/common/icons.ts:1) following existing Phosphor icon pattern. See [icon-system skill](../../../.roo/skills/icon-system/SKILL.md) for adding icons.

### Styling Approach

Use existing design tokens from [`theme.css`](../../../src/styles/theme.css:1):

- Background: `bg-paper` or `bg-background`
- Text: `text-ink`
- Borders: `border-edge`
- Error semantic color: `text-error` already exists

For success/warning colors: Add semantic colors to theme if needed, OR use subtle monochrome approach with icon-based differentiation (implementation team decides based on what fits design system best).

### Storybook Story

Create `AppNotificationContainer.stories.ts` that demonstrates:

- Single success notification
- Single error notification
- Single warning notification
- Multiple stacked notifications (3-4)
- Long message text behavior

### Testing Strategy

**Unit Tests:**

- Default duration application in useNotifications helpers
- Remove notification logic

**Component Tests:**

- Close button dismisses notification
- Notifications appear in correct order
- Animation classes applied correctly

**Manual/E2E Testing:**

- Visual verification of animations
- Cross-page navigation behavior
- Multi-notification stacking

### Related Files

Files that will need modification:

- **New:** `src/features/common/AppNotificationContainer.vue`
- **New:** `src/features/common/AppNotificationContainer.stories.ts`
- **Modified:** [`src/App.vue`](../../../src/App.vue:1) - import and render container, call provideNotifications if not present
- **Modified:** [`src/composables/useNotifications.ts`](../../../src/composables/useNotifications.ts:1) - add default durations to helper methods
- **Modified:** [`src/features/common/icons.ts`](../../../src/features/common/icons.ts:1) - add success/error icons if needed
- **Optional:** [`src/styles/theme.css`](../../../src/styles/theme.css:1) - add semantic colors if desired

### Code Architecture Notes

Follow existing patterns:

- Vue 3 Composition API with `<script setup>`
- TypeScript with proper typing
- Tailwind v4 for styling
- Component in `features/common/` (shared across app)
- Use [`AppIcon`](../../../src/features/common/AppIcon.vue:1) component for icons
- Follow [workflow-vue-components](../../../.roo/skills/workflow-vue-components/SKILL.md) for component development
- Use [i18n-workflow](../../../.roo/skills/i18n-workflow/SKILL.md) if any static strings needed (e.g., accessibility labels)

### Z-Index Considerations

Notification container needs high z-index to appear above all page content:

- Canvas uses `z-index` for node layering
- Ensure notification container has higher z-index than canvas controls
- Suggested: `z-50` or higher (Tailwind scale)
