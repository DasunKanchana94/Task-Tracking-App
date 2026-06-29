# Personal Productivity Web Application — Master Design Document

> Codename: **Flowline** (placeholder name, change freely)
> Inspired by the workflow concepts of the "Structured" mobile app (visual timeline, day planning, drag-and-drop scheduling), but designed and implemented entirely from scratch with original UX, data model, and code. No assets, code, or branding from Structured are used.

---

## Table of Contents

1. [Business Requirements Document (BRD)](#1-business-requirements-document-brd)
2. [Product Requirements Document (PRD)](#2-product-requirements-document-prd)
3. [User Stories](#3-user-stories)
4. [UX Requirements](#4-ux-requirements)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Technical Architecture](#7-technical-architecture)
8. [Folder Structure](#8-folder-structure)
9. [Development Roadmap](#9-development-roadmap)
10. [Future Enhancements](#10-future-enhancements)

---

# 1. Business Requirements Document (BRD)

## 1.1 Executive Summary

Flowline is a personal, single-user productivity web application that combines a **visual daily timeline**, **task and subtask management**, **habit tracking**, **calendar integration**, and **time-blocking** into one cohesive planning surface. It is designed as a premium, daily-driver planner that replaces the need for separate to-do list apps, calendar apps, and habit trackers.

The application is built as a **Progressive Web App (PWA)** with full **offline support**, a **responsive layout** that adapts from mobile to desktop, and a **local-first architecture** backed by a cloud database for durability and multi-device sync (even though there is currently only one user/account).

This document captures the full business rationale, functional and non-functional requirements, user stories, UX specification, database design, API design, technical architecture, and a 20-milestone roadmap sufficient for an engineering team (human or AI) to build the product end-to-end without further clarification.

## 1.2 Product Vision

> "A single calm surface where every task, habit, event, and note for the day has a visible place in time."

Flowline's vision is to give a single power-user a frictionless way to:
- See their entire day as a **visual timeline** (not just a list).
- Plan with **drag-and-drop time blocking**.
- Track **tasks, subtasks, habits, and recurring routines** in one model.
- Reflect on **progress and statistics** over time.
- Work seamlessly **online or offline**, on **mobile or desktop**.

## 1.3 Goals

1. Provide a unified day/week/month timeline view with drag-and-drop time blocking.
2. Support rich task management: subtasks, tags, priorities, estimated/actual duration, attachments, rich text notes.
3. Support habits and recurring tasks/schedules with flexible recurrence rules.
4. Provide calendar integration (Google Calendar two-way sync, ICS import/export).
5. Provide a focus mode (Pomodoro-style) tied to tasks/time blocks.
6. Provide statistics and progress tracking (completion rates, time spent vs. estimated, streaks).
7. Be fully usable offline as an installable PWA, syncing when back online.
8. Be visually polished with light/dark mode and multiple theme options.
9. Be fast, accessible, secure, and maintainable as a long-term personal tool that could later support more users.

## 1.4 Target User

- **Primary persona**: The product owner — a single, technically proficient user who wants a personal daily planner.
- Single-tenant initially: one authenticated user account using the app across multiple devices (desktop browser, mobile browser, installed PWA).
- The architecture must not preclude adding multi-user support later (every table is already user-scoped via `user_id`), but no team/sharing features are required now.

## 1.5 Functional Requirements

This is the canonical feature checklist. Every item below is a required feature of v1 unless explicitly marked "Future" (see Section 10).

### 1.5.1 Timeline & Scheduling
- Visual vertical timeline for a day (hour-by-hour, configurable granularity: 15/30/60 min).
- Day / 3-day / Week / Month views.
- Drag-and-drop to create, move, and resize time blocks on the timeline.
- Time blocking: assign any task or habit a start time + duration, rendered as a block.
- Unscheduled "inbox" tray of tasks not yet placed on the timeline.
- Multi-day and all-day events.
- "Now" line indicator showing current time on today's timeline.
- Overlap detection and visual stacking of overlapping blocks.
- Quick "schedule next available slot" action.

### 1.5.2 Calendar Integration
- Two-way sync with Google Calendar (OAuth2).
- ICS feed import (subscribe to read-only external calendars).
- ICS export of the user's own schedule.
- Multiple calendar "layers" with toggleable visibility and color coding.
- Conflict detection between imported calendar events and planned blocks.

### 1.5.3 Tasks & Subtasks
- CRUD for tasks with: title, description (rich text), due date, scheduled time block, priority, tags, status, estimated duration, actual duration (tracked via focus sessions/timer), checklist of subtasks.
- Unlimited nested subtasks (at least 2 levels deep required, recursive data model supports N levels).
- Drag-and-drop reordering of tasks and subtasks.
- Drag-and-drop of tasks onto the timeline to schedule them.
- Bulk actions (multi-select complete/delete/move/tag).
- Task dependencies (optional "blocked by" relationship) — soft dependency, advisory only.
- Task completion history retained indefinitely for stats.

### 1.5.4 Habits & Recurrence
- Habit tracking with custom frequency (daily, weekly, specific weekdays, X times per week, monthly).
- Streak tracking (current streak, longest streak), with "streak freeze"/grace day option.
- Recurring tasks (RRULE-based recurrence: daily/weekly/monthly/yearly/custom interval, end date or count).
- Repeating schedules / routines: a named group of time blocks that can be applied to a day (e.g., "Workday routine", "Gym day").
- Habit check-in from timeline or dedicated Habits page.

### 1.5.5 Templates
- Day templates (a full pre-built timeline of blocks) applicable to any date.
- Task templates (pre-filled task with subtasks, tags, estimated duration).
- Routine templates (named sets of recurring blocks, see above).

### 1.5.6 Progress Tracking & Statistics
- Daily/weekly/monthly completion rate.
- Estimated vs actual duration analysis.
- Habit streak charts/heatmaps (GitHub-style contribution calendar).
- Time-spent-by-tag/category breakdown (pie/bar charts).
- Focus session statistics (total focus time, sessions completed, average session length).
- Productivity trends over time (line charts).
- Exportable reports (CSV/PDF) for a date range.

### 1.5.7 Focus Mode
- Pomodoro-style timer (configurable work/break intervals) bound to a task.
- Full-screen distraction-free focus view showing only the active task/subtasks and timer.
- Automatic logging of actual duration to the task upon session completion.
- Ambient sound options (optional, local audio files) — Future-flagged if scope-constrained, but included as v1-nice-to-have.
- Browser tab title countdown, desktop notification at session end.

### 1.5.8 Appearance
- Light mode, dark mode, system-preference auto mode.
- Multiple curated themes (at least 5 color themes) selectable independently of light/dark.
- Per-tag custom colors and emoji/icon.

### 1.5.9 Organization & Discovery
- Global search (tasks, notes, habits, tags) with fuzzy matching, keyboard-accessible (Cmd/Ctrl+K command palette).
- Filters: by tag, priority, status, date range, completion state.
- Saved filter views ("Smart Lists": Today, Overdue, This Week, Flagged, No Date).
- Tags: multi-tag per task, color + emoji per tag, tag management page.
- Priorities: None/Low/Medium/High/Urgent, each with a color.

### 1.5.10 Notes & Attachments
- Rich text notes attached to tasks or standalone (bold/italic/underline/strikethrough, headings, bullet/numbered lists, checkboxes, links, code blocks, blockquote).
- File attachments per task/note (images, PDFs, docs) stored in object storage, with thumbnail preview for images.
- Emoji support throughout (titles, tags, notes) via emoji picker.
- Icon picker for tasks/projects/tags (curated icon set, e.g., Lucide icons).

### 1.5.11 Notifications & Reminders
- Browser push notifications (Web Push API) for upcoming time blocks, task due times, habit reminders.
- In-app notification center/log.
- Snooze / dismiss / "mark done from notification" actions.
- Daily summary notification ("Today you have 6 tasks and 2 habits").
- Configurable quiet hours.

### 1.5.12 Keyboard & Power-User Features
- Full keyboard shortcut set (navigation, quick-add task, command palette, complete task, toggle dark mode, etc.) — documented shortcut cheat-sheet dialog (`?`).
- Quick-add via natural language parsing (e.g., "Call mom tomorrow 5pm for 30m #personal").

### 1.5.13 Platform
- Mobile responsive layout (single-column, bottom nav, swipe gestures).
- Desktop optimized layout (multi-column: sidebar + list + timeline + detail panel).
- Offline support: full CRUD on tasks/habits/timeline while offline using local persistence (IndexedDB) and background sync queue.
- PWA: installable, app icon, splash screen, offline fallback page, service worker caching strategy.

### 1.5.14 Account & Settings
- Single-user authenticated account (email/password + optional OAuth Google login).
- Profile settings (name, avatar, timezone, week-start day, locale, time format 12/24h).
- Data export (full JSON export) and data import.
- Data backup: automatic periodic export to storage + manual "export now".
- Account deletion (purges all user data) — required even for a single-user app, for completeness and law-of-least-surprise.

## 1.6 Non-Functional Requirements

### Performance
- First Contentful Paint < 1.5s on broadband; Time-to-Interactive < 3s.
- Timeline interactions (drag/resize) must render at 60fps; debounce persistence writes.
- API p95 response time < 200ms for CRUD operations under normal load.
- Pagination/virtualization for long lists (tasks, history, notifications).

### Scalability
- Stateless backend (horizontally scalable) behind a load balancer, even though current load is single-user.
- Database schema is multi-tenant-ready (`user_id` foreign key everywhere) so adding users later requires no migration.
- Background job queue for sync, notification dispatch, and recurring task generation, decoupled from request path.

### Accessibility
- WCAG 2.1 AA conformance target.
- Full keyboard navigability of all interactive elements; visible focus states.
- Sufficient color contrast in all themes (validated via automated contrast checks).
- ARIA roles/labels on custom components (drag handles, timeline blocks, dialogs).
- Respect `prefers-reduced-motion`.

### SEO
- Marketing/landing page (if public) is SSR/SSG with proper meta tags, Open Graph, sitemap.
- The authenticated app itself is not indexable (`noindex`), as it's a private tool.

### Security
- Argon2/bcrypt password hashing; OAuth2 (Google) as alternative login.
- JWT access tokens (short-lived) + httpOnly refresh token cookies; CSRF protection on state-changing requests.
- Rate limiting on auth endpoints.
- All data scoped strictly by `user_id`; row-level authorization checks on every query.
- Input validation/sanitization (rich text sanitized against XSS) on both client and server.
- Signed, time-limited URLs for attachment access in object storage.
- Encrypted secrets via environment/secret manager; TLS everywhere.

### Responsiveness
- Breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px).
- Touch-friendly hit targets (≥44px) on mobile; pointer-optimized drag handles on desktop.

### Offline Capability
- Service worker caches app shell and static assets (cache-first).
- IndexedDB mirrors core entities (tasks, habits, blocks, tags) for offline read/write.
- Mutation queue with optimistic UI + background sync + conflict resolution (last-write-wins with `updated_at` versioning, surfaced to user on true conflicts).

### Data Backup
- Nightly automated DB snapshot (cloud provider managed backups, e.g., point-in-time recovery).
- User-triggered full JSON export downloadable at any time.
- Soft-delete (trash) for tasks/notes with 30-day retention before hard delete.

---

# 2. Product Requirements Document (PRD)

The PRD is expressed through the Functional Requirements above (Section 1.5), the User Stories (Section 3), and the UX Requirements (Section 4). Scope boundary: v1 ships everything in Section 1.5; anything in Section 10 (Future Enhancements) is explicitly out of scope for v1.

## 2.1 Success Metrics (single-user context)
- Daily active use (the user opens the app every day).
- ≥90% of scheduled tasks/habits have a completion status recorded by end of day.
- Sync latency from offline → online < 5s for queued mutations.
- Zero data loss incidents (validated by backup restore drills).

## 2.2 Out of Scope (v1)
- Multi-user collaboration, sharing, comments, real-time co-editing.
- Native mobile apps (web/PWA only).
- Third-party calendar providers beyond Google + generic ICS.
- AI assistant features (deferred to Future Enhancements).

---

# 3. User Stories

Format: **As a user, I want to ___, so that ___.** Grouped by feature area. (150+ stories.)

### Authentication & Account (1–8)
1. As a user, I want to sign up with email/password, so that I can create my account.
2. As a user, I want to log in with Google OAuth, so that I don't need a separate password.
3. As a user, I want to reset my forgotten password via email, so that I can regain access.
4. As a user, I want to stay logged in across sessions, so that I don't re-authenticate every visit.
5. As a user, I want to update my profile (name, avatar, timezone), so that the app reflects my identity and local time correctly.
6. As a user, I want to set my preferred week-start day, so that calendar views match my convention.
7. As a user, I want to delete my account and all data, so that I can fully remove my information if needed.
8. As a user, I want to log out from all devices, so that I can secure my account if a device is lost.

### Timeline & Time Blocking (9–30)
9. As a user, I want to see today's schedule as a vertical timeline, so that I can visualize my day.
10. As a user, I want to drag a task from the inbox onto the timeline, so that I can schedule it.
11. As a user, I want to drag a time block to a new time, so that I can reschedule it quickly.
12. As a user, I want to resize a time block by dragging its edge, so that I can change its duration.
13. As a user, I want to see a "now" indicator line, so that I know where I am in the day.
14. As a user, I want overlapping blocks to stack side by side, so that I can see conflicts clearly.
15. As a user, I want to switch between day, 3-day, week, and month views, so that I can plan at different zoom levels.
16. As a user, I want to create a new time block by clicking and dragging on empty timeline space, so that I can quickly schedule new time.
17. As a user, I want to set the timeline granularity (15/30/60 min), so that I can plan with the precision I prefer.
18. As a user, I want to mark a time block as an all-day event, so that I can represent non-time-specific items.
19. As a user, I want multi-day events to span across days in week/month view, so that I can see trips or long events.
20. As a user, I want to click "find next available slot" for a task, so that the app auto-schedules it without conflicts.
21. As a user, I want unscheduled tasks to appear in an "inbox" panel beside the timeline, so that I always see what's not yet planned.
22. As a user, I want to delete a time block without deleting the underlying task, so that the task returns to the inbox.
23. As a user, I want to color-code time blocks by tag or category, so that I can visually scan my day.
24. As a user, I want to zoom the timeline in/out (pinch or buttons), so that I can see more or less detail.
25. As a user, I want keyboard shortcuts to move the focused block ±15 minutes, so that I can adjust schedule without a mouse.
26. As a user, I want to duplicate a time block to another day, so that I can repeat one-off plans quickly.
27. As a user, I want to see a mini-month calendar in the sidebar, so that I can jump to any date.
28. As a user, I want to navigate between days/weeks with arrow keys or swipe gestures, so that planning is fast.
29. As a user, I want the timeline to auto-scroll to the current time on load, so that I land on the relevant section.
30. As a user, I want to print or export my day's schedule as an image/PDF, so that I can share or archive it.

### Calendar Integration (31–42)
31. As a user, I want to connect my Google Calendar account, so that my events appear in Flowline.
32. As a user, I want two-way sync so changes in Flowline reflect in Google Calendar and vice versa.
33. As a user, I want to subscribe to a public ICS calendar URL, so that I can see holidays/sports schedules.
34. As a user, I want to export my Flowline schedule as an ICS file, so that I can import it elsewhere.
35. As a user, I want to toggle visibility of each connected calendar layer, so that I can declutter my view.
36. As a user, I want each calendar to have a distinct color, so that I can distinguish sources at a glance.
37. As a user, I want to be warned of conflicts between an imported event and a planned block, so that I can resolve double-booking.
38. As a user, I want to disconnect a calendar integration, so that I can stop syncing it.
39. As a user, I want sync errors (auth expired, rate limit) to be surfaced clearly, so that I know to reconnect.
40. As a user, I want imported events to be read-only in Flowline, so that I don't accidentally edit a synced source incorrectly.
41. As a user, I want manual "sync now" control, so that I don't have to wait for the scheduled sync interval.
42. As a user, I want to choose which Flowline tasks get pushed to Google Calendar, so that I control what's shared.

### Tasks (43–70)
43. As a user, I want to create a task with just a title in one click, so that capture is frictionless.
44. As a user, I want to add a description with rich text formatting, so that I can include detail.
45. As a user, I want to set a due date and optional due time, so that I know when something is needed.
46. As a user, I want to assign a priority level, so that I can triage my work.
47. As a user, I want to add multiple tags to a task, so that I can categorize it across dimensions.
48. As a user, I want to set an estimated duration, so that I can time-block accurately.
49. As a user, I want the app to track actual duration via focus sessions, so that I can compare estimate vs reality.
50. As a user, I want to mark a task complete with one click/tap, so that completion is fast.
51. As a user, I want to un-complete a task, so that I can correct mistakes.
52. As a user, I want to delete a task (to trash), so that I can remove clutter while retaining recovery options.
53. As a user, I want to restore a task from trash within 30 days, so that I can undo accidental deletion.
54. As a user, I want to permanently purge trash, so that I can clean up immediately if desired.
55. As a user, I want to add subtasks to a task, so that I can break down work.
56. As a user, I want subtasks nested arbitrarily deep, so that I can model complex projects.
57. As a user, I want to reorder subtasks via drag-and-drop, so that I can prioritize within a task.
58. As a user, I want a progress bar showing subtask completion %, so that I can see how far along a task is.
59. As a user, I want to convert a subtask into a top-level task, so that I can promote it when it grows in scope.
60. As a user, I want to bulk select multiple tasks, so that I can complete/delete/tag/move them together.
61. As a user, I want to set a task as "blocked by" another task, so that I see dependency order.
62. As a user, I want blocked tasks visually flagged, so that I don't start them prematurely.
63. As a user, I want to attach files to a task, so that I can keep reference material together.
64. As a user, I want image attachments to show thumbnails, so that I can preview without downloading.
65. As a user, I want to pick an emoji or icon for a task, so that I can visually identify it quickly.
66. As a user, I want to duplicate a task (with or without subtasks), so that I can reuse structure.
67. As a user, I want to move a task to a different date without opening the editor, so that rescheduling is fast.
68. As a user, I want quick-add natural language parsing ("Gym tomorrow 6am 45m #health"), so that capture is fast.
69. As a user, I want undo for the last destructive action (delete/complete), so that I can recover from mistakes immediately.
70. As a user, I want a "no date" smart list, so that I can see tasks I haven't scheduled.

### Habits & Recurrence (71–92)
71. As a user, I want to create a habit with a custom frequency, so that I can track recurring behaviors.
72. As a user, I want to define "X times per week" habits, so that I have flexibility beyond fixed days.
73. As a user, I want to check off a habit for today directly from the timeline or habits page, so that logging is fast.
74. As a user, I want to see my current streak and longest streak per habit, so that I'm motivated to continue.
75. As a user, I want a "streak freeze" to preserve my streak on a planned day off, so that one skip doesn't erase progress.
76. As a user, I want a heatmap/contribution-calendar view of a habit's history, so that I can see consistency at a glance.
77. As a user, I want to archive a habit without deleting its history, so that I can pause tracking without losing data.
78. As a user, I want to set a reminder time for a habit, so that I get nudged to do it.
79. As a user, I want to create a recurring task using RRULE-style rules (daily/weekly/monthly/custom interval), so that I don't recreate repeating chores.
80. As a user, I want recurring tasks to generate individual instances I can complete independently, so that history per occurrence is preserved.
81. As a user, I want to edit "this occurrence only" or "all future occurrences" of a recurring task, so that I have flexible control.
82. As a user, I want to end a recurrence after N occurrences or by a specific date, so that I can bound it.
83. As a user, I want to skip a single occurrence without breaking the recurrence pattern, so that exceptions are easy.
84. As a user, I want to create a "routine" — a named set of time blocks (e.g., morning routine), so that I can apply it to any day in one action.
85. As a user, I want routines to be assignable to specific weekdays automatically, so that my recurring schedule self-populates.
86. As a user, I want to see all my active habits in one dashboard, so that I can review today's habit checklist.
87. As a user, I want a weekly habit completion percentage, so that I can track adherence.
88. As a user, I want to reorder habits in my list, so that I can prioritize visually.
89. As a user, I want habit check-ins to sync offline, so that I can log them without connectivity.
90. As a user, I want to set a target count for a habit (e.g., drink 8 glasses of water), so that I can track quantities, not just binary completion.
91. As a user, I want partial progress logging for count-based habits, so that I can log incremental progress through the day.
92. As a user, I want to convert a habit into a recurring task or vice versa, so that I can change tracking style without losing history.

### Templates (93–100)
93. As a user, I want to save the current day's layout as a day template, so that I can reuse it.
94. As a user, I want to apply a day template to any date, so that planning a typical day is one click.
95. As a user, I want to create a task template with pre-filled fields and subtasks, so that recurring project setups are fast.
96. As a user, I want to manage (edit/delete/rename) my templates from a dedicated page, so that my template library stays clean.
97. As a user, I want template categories (e.g., Work, Personal), so that I can organize many templates.
98. As a user, I want to preview a template before applying it, so that I know what it will add.
99. As a user, I want applying a template to merge with (not overwrite) existing blocks on that day, so that I don't lose existing plans.
100. As a user, I want to share/export a template as a JSON file, so that I can back it up or move it between accounts later.

### Progress Tracking & Statistics (101–118)
101. As a user, I want a dashboard showing today's completion percentage, so that I can gauge my day at a glance.
102. As a user, I want a weekly summary of tasks completed vs planned, so that I can review my week.
103. As a user, I want a chart comparing estimated vs actual duration per task/category, so that I can improve my estimates.
104. As a user, I want a time-spent-by-tag breakdown (pie chart), so that I see where my time goes.
105. As a user, I want a productivity trend line over the last 30/90 days, so that I can spot patterns.
106. As a user, I want total focus time and number of focus sessions tracked, so that I can measure deep work.
107. As a user, I want a habit consistency heatmap (like GitHub contributions), so that I can visualize long-term adherence.
108. As a user, I want to filter statistics by date range, so that I can analyze custom periods.
109. As a user, I want to export a statistics report as CSV, so that I can analyze in a spreadsheet.
110. As a user, I want to export a statistics report as PDF, so that I can archive a clean snapshot.
111. As a user, I want to see my most-used tags, so that I understand my focus areas.
112. As a user, I want to see overdue task counts trending over time, so that I can spot if I'm falling behind.
113. As a user, I want a "best day of week" insight, so that I can learn my own patterns.
114. As a user, I want a comparison between this week and last week, so that I can track improvement.
115. As a user, I want completion history retained indefinitely per task, so that long-term stats stay accurate.
116. As a user, I want a calendar heatmap of daily completion rate, so that I can see consistency over a year.
117. As a user, I want average task duration accuracy (estimate error %) tracked per tag, so that I refine future estimates.
118. As a user, I want a printable weekly/monthly review page, so that I can do a paper-style retro.

### Focus Mode (119–128)
119. As a user, I want to start a Pomodoro timer on a specific task, so that I can do focused work.
120. As a user, I want to configure work/break interval lengths, so that the timer matches my preferred technique.
121. As a user, I want a full-screen distraction-free view during focus mode, so that I minimize distraction.
122. As a user, I want the browser tab title to show a countdown, so that I can monitor time without switching tabs.
123. As a user, I want a notification when a focus session ends, so that I know to take a break.
124. As a user, I want completed focus sessions to automatically add to the task's actual duration, so that tracking is automatic.
125. As a user, I want to pause/resume/cancel a focus session, so that I have control over interruptions.
126. As a user, I want optional ambient background sounds during focus sessions, so that I can mask distractions.
127. As a user, I want a history of past focus sessions per task, so that I can review my deep work over time.
128. As a user, I want a global "focus mode" toggle that hides all non-essential UI, so that I can concentrate app-wide.

### Search, Filters, Tags (129–142)
129. As a user, I want a global command palette (Cmd/Ctrl+K), so that I can search and act quickly from anywhere.
130. As a user, I want fuzzy search across tasks, notes, habits and tags, so that imprecise queries still find results.
131. As a user, I want to filter tasks by tag, priority, status, and date range simultaneously, so that I can narrow lists precisely.
132. As a user, I want to save a filter combination as a named "Smart List," so that I can revisit it instantly.
133. As a user, I want default smart lists (Today, Overdue, This Week, Flagged, No Date), so that common views are available immediately.
134. As a user, I want to create, rename, recolor, and delete tags, so that my taxonomy stays organized.
135. As a user, I want to assign an emoji to a tag, so that I can recognize it visually in lists.
136. As a user, I want to merge two tags into one, so that I can clean up duplicates.
137. As a user, I want to see a count of tasks per tag, so that I can gauge tag usage.
138. As a user, I want to filter the timeline itself by tag, so that I can focus on one area of life.
139. As a user, I want search results to be keyboard-navigable, so that I never need the mouse.
140. As a user, I want recently viewed/edited items listed in the command palette, so that I can quickly return to context.
141. As a user, I want to flag/star a task for quick access, so that important items are easy to surface.
142. As a user, I want a "starred" smart list, so that I can see all flagged items together.

### Notes & Attachments (143–150)
143. As a user, I want to write standalone rich-text notes not tied to a task, so that I can journal or jot ideas.
144. As a user, I want to format notes (bold, italic, lists, checkboxes, headings, code blocks, links), so that notes are expressive.
145. As a user, I want to attach a note to a task, so that detailed context travels with the task.
146. As a user, I want to upload file attachments (images/PDFs/docs) to a task or note, so that reference material is centralized.
147. As a user, I want attachments to show file size and type icon, so that I know what I'm opening.
148. As a user, I want to delete an attachment, so that I can manage storage.
149. As a user, I want an emoji picker available in any text field, so that I can express things visually.
150. As a user, I want a note list/library page with search, so that I can browse all my notes independently of tasks.

### Notifications, Settings, Platform (151–168)
151. As a user, I want browser push notifications for upcoming time blocks, so that I don't miss what's next.
152. As a user, I want a reminder notification before a task's due time, so that I have lead time to act.
153. As a user, I want habit reminder notifications at a chosen time, so that I build consistency.
154. As a user, I want an in-app notification center/log, so that I can review what I might have missed.
155. As a user, I want to snooze a notification, so that I get reminded again later.
156. As a user, I want to mark a task done directly from a notification, so that I don't need to open the app.
157. As a user, I want to configure quiet hours during which no notifications fire, so that my sleep isn't disturbed.
158. As a user, I want a daily summary notification each morning, so that I get an overview proactively.
159. As a user, I want to toggle dark mode, light mode, or follow system setting, so that the app matches my environment.
160. As a user, I want to choose among multiple color themes, so that I can personalize the look.
161. As a user, I want a full keyboard shortcut cheat sheet (`?`), so that I can learn power-user controls.
162. As a user, I want the app usable fully offline (view/create/edit/complete), so that connectivity issues don't block me.
163. As a user, I want offline changes to sync automatically once back online, so that I don't lose work.
164. As a user, I want to install the app as a PWA on my phone/desktop, so that it behaves like a native app.
165. As a user, I want a responsive mobile layout with bottom navigation, so that the app is usable one-handed.
166. As a user, I want a desktop layout with sidebar, list, and timeline visible simultaneously, so that I can multitask visually.
167. As a user, I want to export all my data as JSON at any time, so that I always control my data.
168. As a user, I want automatic nightly backups of my data, so that I'm protected against data loss.

*(168 user stories provided, exceeding the 150 minimum.)*

---

# 4. UX Requirements

## 4.1 Information Architecture / Navigation

Primary navigation (desktop: left sidebar; mobile: bottom tab bar):
1. **Today** (default landing page — timeline + inbox)
2. **Calendar** (week/month views)
3. **Tasks** (list view with filters/smart lists)
4. **Habits**
5. **Notes**
6. **Statistics**
7. **Templates** (accessible via Tasks/Calendar overflow menu or its own nav item on desktop)
8. **Settings**

Global elements:
- Top bar: current date display, quick-add button (`+`), search/command palette trigger, notification bell, avatar/profile menu, theme toggle.
- Command palette (Cmd/Ctrl+K) overlays any page.

## 4.2 Page-by-Page Specification

### 4.2.1 Today (Timeline) Page
**Layout (desktop)**: 3-column — left: mini calendar + smart lists + tag filter; center: vertical timeline for selected date with "now" line; right: unscheduled inbox + selected task detail panel.
**Layout (mobile)**: single column; timeline is primary, inbox accessible via a swipe-up drawer or tab toggle ("Timeline" / "Inbox").

**Wireframe description (desktop)**:
```
┌─────────────┬───────────────────────────────┬─────────────────┐
│ Mini Cal     │  [Date Nav: < Today >]        │ Inbox (unsched.) │
│ Smart Lists  │  08:00 ──────────────         │  - Task A        │
│  - Today     │  09:00 ┌─────────────┐ now—   │  - Task B        │
│  - Overdue   │        │ Block: Gym  │        │                  │
│  - Flagged   │  10:00 └─────────────┘        │ ────────────────│
│ Tag Filters  │  11:00 ┌───────────┐          │ Task Detail Panel│
│  #work #home │        │ Block: ... │         │ (when selected)  │
└─────────────┴───────────────────────────────┴─────────────────┘
```
- Drag a block: pointer-down on block body → vertical drag → snap to grid (granularity setting) → drop to commit (optimistic update, then PATCH).
- Resize: drag bottom-edge handle; live duration label shown during drag.
- Create from empty space: click-drag downward creates a draft block, opens inline quick editor (title, then save) anchored at drop point.
- Drag from inbox to timeline: drag card; drop target shows a ghost preview snapped to grid.
- **Empty states**: Inbox empty → "Nothing waiting to be scheduled. 🎉" with quick-add CTA. Timeline with no blocks → faint grid only, centered hint "Drag a task here, or click+drag to add time."
- **Loading state**: skeleton timeline (gray block placeholders) while fetching; skeleton inbox cards.
- **Error state**: inline banner "Couldn't load today's schedule — Retry" with retry button; cached/offline data shown if available with an "offline — showing cached data" badge.
- **Success/feedback**: toast on schedule/move/complete actions ("Block moved to 3:00 PM" with Undo action).

### 4.2.2 Calendar Page (Week/Month)
- Week view: 7-column grid, same timeline-per-day concept compressed; drag-and-drop across days supported (drag a block to a different day column).
- Month view: standard month grid, each cell shows up to 3 event/task chips + "+N more"; click a day to jump into Today/day view.
- Calendar layer toggle panel (checkboxes per connected calendar with color swatch).
- **Empty state**: month with no events shows plain grid, no banner needed.
- **Error state**: "Calendar sync failed — Reconnect Google Calendar" banner with action button when token expired.

### 4.2.3 Tasks Page (List View)
- Top: search box, filter chips (tag/priority/status/date), view toggle (List / Board-by-status, optional Kanban Future item kept minimal in v1 as List only — Kanban can be Future).
- List grouped by Smart List or by due date; each row: checkbox, emoji/icon, title, tags (chips), priority dot, due date, estimated duration, subtask progress ring.
- Row expands inline to show subtasks (indented, draggable).
- Bulk-select mode via checkbox in row hover / long-press on mobile, revealing a bulk action bar (Complete, Delete, Tag, Move date).
- **Empty state**: "No tasks here yet." illustration + quick-add CTA, varies per smart list (e.g., Overdue empty → "You're all caught up! 🎉").
- **Loading state**: skeleton rows (5–8 shimmering placeholders).
- **Error state**: inline retry banner at top of list, rest of list shows cached data if present.

### 4.2.4 Task Detail Dialog/Panel
- Opens as a right-side slide-over panel on desktop, full-screen modal on mobile.
- Sections: Title (inline editable), Description (rich text editor), Subtasks (checklist with add-row at bottom, drag handles), Schedule (date/time/duration pickers + "Add to timeline" button), Priority selector, Tags multi-select with inline create, Attachments (drag-drop upload zone + thumbnail grid), Notes (linked rich text note), Activity/History (completion log, created/updated timestamps), Dependencies ("Blocked by" picker).
- Footer actions: Duplicate, Delete (to trash), Convert subtask↔task (if applicable).
- **Loading**: skeleton panel.
- **Error**: "Failed to save changes — Retry" inline near the field that failed, with the field's edit preserved (not lost).
- **Success**: subtle inline checkmark flash on autosave per field (autosave on blur/debounced typing).

### 4.2.5 Habits Page
- Card grid or list of habits; each card: icon/emoji, name, today's check-in control (checkbox or counter stepper for count-based), streak flame icon + number, mini heatmap sparkline.
- Habit detail dialog: full heatmap (12-month), frequency editor, reminder time, streak-freeze toggle, archive button.
- **Empty state**: "No habits yet — build your first routine." CTA "Create Habit."
- **Loading**: skeleton cards.
- **Error**: inline banner; cached habit list still interactive offline (check-ins queue).

### 4.2.6 Notes Page
- Master-detail layout: left list of notes (title + snippet + updated date), right rich-text editor pane.
- Search box filters left list.
- New note button creates blank note focused on title.
- **Empty state**: "No notes yet. Start writing." with a "New Note" CTA centered in the editor pane.
- **Loading**: skeleton list + blank editor shimmer.
- **Error**: "Couldn't save note" toast with retry; local draft retained in IndexedDB until saved.

### 4.2.7 Statistics Page
- Top: date-range selector (Today/Week/Month/Custom).
- Grid of stat cards (completion %, focus time, streaks summary) followed by charts: line (trend), bar (estimate vs actual), pie (time by tag), heatmap (habit consistency / daily completion).
- Export buttons (CSV, PDF) top-right.
- **Empty state**: "Not enough data yet — complete a few tasks to see insights." with illustration.
- **Loading**: skeleton chart placeholders (animated bars).
- **Error**: "Couldn't compute statistics — Retry."

### 4.2.8 Templates Page
- Tabs: Day Templates / Task Templates / Routines.
- Grid of template cards with preview thumbnail (mini timeline render for day templates), name, category chip, "Apply" and overflow menu (Edit/Duplicate/Delete/Export).
- "Apply" opens a small dialog: pick target date, confirm merge behavior.
- **Empty state**: per tab, "No [day templates / task templates / routines] yet" + "Create from current day" CTA where relevant.

### 4.2.9 Focus Mode (Full-Screen Overlay)
- Minimal UI: task title, large circular timer, progress ring, Pause/Resume/End buttons, ambient sound toggle, subtask checklist (collapsed by default).
- On session end: confirmation toast + auto-return to previous page, with actual duration recorded.
- Exit via Esc key or explicit "End Session" button (confirms if mid-session).

### 4.2.10 Settings Page
- Sections (left tab list, right content pane): Profile, Appearance (theme/dark mode), Notifications (quiet hours, reminder defaults), Calendar Integrations, Data (export/import/backup, trash management), Keyboard Shortcuts (read-only cheat sheet), Account (password change, delete account, logout-all-devices).

### 4.2.11 Auth Pages
- Login, Sign Up, Forgot Password, Reset Password — minimal centered card layout, Google OAuth button prominent, form validation inline (field-level error text), loading spinner on submit button, success redirect to Today page.

### 4.2.12 Command Palette (Global Dialog)
- Centered modal, search input autofocus, grouped results (Actions, Tasks, Notes, Habits, Tags, Navigation), keyboard up/down/enter navigation, `Esc` to close.
- **Empty results state**: "No results for 'xyz'" with a "Create task 'xyz'" quick action.

### 4.2.13 Trash Page (within Settings → Data)
- List of soft-deleted tasks/notes with deletion date and "days remaining" badge, Restore and Delete Forever actions per row, "Empty Trash" bulk action with confirmation dialog.

## 4.3 Global Dialogs
- Quick Add dialog (natural language input + smart parse preview).
- Confirm Delete dialog (used for tasks/habits/templates/attachments).
- Emoji Picker popover.
- Icon Picker popover.
- Color Picker popover (for tags/themes).
- Tag Create/Edit dialog.
- Recurrence Rule Editor dialog (visual RRULE builder: frequency, interval, end condition, by-weekday).
- Template Apply dialog.
- Conflict Resolution dialog (offline sync conflicts).
- Keyboard Shortcuts cheat sheet dialog.
- Export Data dialog (format choice, date range for stats export).
- Attachment Upload progress dialog/toast.

## 4.4 Loading / Error / Success / Empty Pattern (App-Wide Convention)
- **Loading**: skeleton placeholders matching final layout shape; never a blank white screen beyond first paint.
- **Error**: inline, contextual, with a Retry affordance; never a full-page crash unless unrecoverable (then a friendly "Something went wrong" page with reload button and error reference id).
- **Success**: toast notifications (bottom-center on mobile, bottom-right on desktop), auto-dismiss after 4s, with Undo where applicable.
- **Empty**: friendly copy + relevant primary CTA + optional illustration; never just a blank list.

---

# 5. Database Design

Relational schema (PostgreSQL). All tables include `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` unless noted. All user-owned tables include `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE` to keep the schema multi-tenant-ready.

## 5.1 Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | TEXT UNIQUE NOT NULL | |
| password_hash | TEXT NULL | null if OAuth-only |
| name | TEXT | |
| avatar_url | TEXT | |
| timezone | TEXT NOT NULL DEFAULT 'UTC' | IANA tz name |
| locale | TEXT DEFAULT 'en-US' | |
| week_start_day | SMALLINT DEFAULT 0 | 0=Sunday |
| time_format | SMALLINT DEFAULT 24 | 12/24 |
| theme | TEXT DEFAULT 'default' | |
| color_mode | TEXT DEFAULT 'system' | light/dark/system |
| created_at, updated_at | | |
Indexes: unique(email).

### `oauth_accounts`
| id PK | user_id FK→users | provider TEXT (`google`) | provider_account_id TEXT | access_token TEXT (encrypted) | refresh_token TEXT (encrypted) | expires_at TIMESTAMPTZ | created_at |
Indexes: unique(provider, provider_account_id).

### `sessions`
| id PK | user_id FK | refresh_token_hash TEXT | user_agent TEXT | ip TEXT | expires_at | created_at |
Indexes: idx(user_id), idx(expires_at).

### `tags`
| id PK | user_id FK | name TEXT NOT NULL | color TEXT | emoji TEXT | created_at | updated_at |
Indexes: unique(user_id, name).

### `task_tags` (join table)
| task_id FK→tasks(id) ON DELETE CASCADE | tag_id FK→tags(id) ON DELETE CASCADE |
PK: (task_id, tag_id). Index on tag_id.

### `projects` (optional grouping/category for tasks, lightweight)
| id PK | user_id FK | name TEXT | color TEXT | emoji TEXT | archived BOOLEAN DEFAULT false | created_at | updated_at |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→users | |
| parent_task_id | UUID NULL FK→tasks(id) ON DELETE CASCADE | self-ref for subtasks, arbitrary depth |
| project_id | UUID NULL FK→projects(id) ON DELETE SET NULL | |
| title | TEXT NOT NULL | |
| description_rich | JSONB | rich text doc (e.g., ProseMirror/Tiptap JSON) |
| status | TEXT NOT NULL DEFAULT 'pending' | pending/in_progress/completed/cancelled |
| priority | SMALLINT DEFAULT 0 | 0 none,1 low,2 med,3 high,4 urgent |
| due_date | DATE NULL | |
| due_time | TIME NULL | |
| estimated_minutes | INTEGER NULL | |
| actual_minutes | INTEGER NOT NULL DEFAULT 0 | accumulated from focus sessions |
| icon | TEXT NULL | icon key |
| emoji | TEXT NULL | |
| sort_order | DOUBLE PRECISION NOT NULL DEFAULT 0 | for manual ordering (fractional indexing) |
| starred | BOOLEAN NOT NULL DEFAULT false | |
| is_template_instance | BOOLEAN DEFAULT false | |
| recurrence_id | UUID NULL FK→recurrences(id) ON DELETE SET NULL | |
| recurrence_instance_date | DATE NULL | the specific occurrence date if generated from recurrence |
| completed_at | TIMESTAMPTZ NULL | |
| deleted_at | TIMESTAMPTZ NULL | soft delete (trash) |
| created_at, updated_at | | |
Indexes: idx(user_id, due_date), idx(parent_task_id), idx(recurrence_id), idx(user_id, status), idx(user_id, deleted_at), GIN on description_rich (optional, for search), idx(user_id, starred).

### `task_dependencies`
| task_id FK→tasks | blocked_by_task_id FK→tasks | PK(task_id, blocked_by_task_id) |
Constraint: task_id <> blocked_by_task_id.

### `recurrences`
| id PK | user_id FK | rrule TEXT NOT NULL | RFC5545 RRULE string | start_date DATE NOT NULL | end_date DATE NULL | end_count INTEGER NULL | timezone TEXT | created_at | updated_at |

### `recurrence_exceptions`
| id PK | recurrence_id FK→recurrences | exception_date DATE NOT NULL | action TEXT NOT NULL | `skip` or `modified` | modified_task_id UUID NULL FK→tasks |
Indexes: unique(recurrence_id, exception_date).

### `time_blocks`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| task_id | UUID NULL FK→tasks(id) ON DELETE CASCADE | nullable: a block can be a free-standing event |
| habit_id | UUID NULL FK→habits(id) ON DELETE CASCADE | |
| title | TEXT | denormalized for free-standing events |
| start_at | TIMESTAMPTZ NOT NULL | |
| end_at | TIMESTAMPTZ NOT NULL | |
| all_day | BOOLEAN DEFAULT false | |
| color | TEXT NULL | overrides tag color if set |
| source | TEXT NOT NULL DEFAULT 'local' | local/google/ics |
| external_event_id | TEXT NULL | id in source calendar |
| calendar_id | UUID NULL FK→calendars(id) ON DELETE SET NULL | |
| created_at, updated_at | | |
Indexes: idx(user_id, start_at, end_at) (range queries), idx(task_id), idx(habit_id), idx(calendar_id), unique(calendar_id, external_event_id).

### `calendars`
| id PK | user_id FK | provider TEXT (`google`/`ics`/`local`) | name TEXT | color TEXT | ics_url TEXT NULL | google_calendar_id TEXT NULL | visible BOOLEAN DEFAULT true | sync_token TEXT NULL | last_synced_at TIMESTAMPTZ NULL | created_at | updated_at |

### `habits`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| name | TEXT NOT NULL | |
| icon | TEXT NULL | emoji TEXT NULL |
| frequency_type | TEXT NOT NULL | `daily`/`weekly_days`/`times_per_week`/`monthly` |
| frequency_config | JSONB | e.g. `{"weekdays":[1,3,5]}` or `{"timesPerWeek":3}` |
| target_count | INTEGER DEFAULT 1 | for count-based habits |
| reminder_time | TIME NULL | |
| allow_streak_freeze | BOOLEAN DEFAULT false | |
| sort_order | DOUBLE PRECISION DEFAULT 0 | |
| archived | BOOLEAN DEFAULT false | |
| created_at, updated_at | | |
Indexes: idx(user_id, archived).

### `habit_logs`
| id PK | habit_id FK→habits ON DELETE CASCADE | user_id FK | log_date DATE NOT NULL | count INTEGER NOT NULL DEFAULT 1 | is_freeze BOOLEAN DEFAULT false | created_at |
Indexes: unique(habit_id, log_date).

### `notes`
| id PK | user_id FK | task_id UUID NULL FK→tasks(id) ON DELETE CASCADE | title TEXT | content_rich JSONB | deleted_at TIMESTAMPTZ NULL | created_at | updated_at |
Indexes: idx(user_id, deleted_at), idx(task_id), GIN full-text index on extracted plain text (search_vector TSVECTOR, generated column).

### `attachments`
| id PK | user_id FK | task_id UUID NULL FK→tasks | note_id UUID NULL FK→notes | file_name TEXT | mime_type TEXT | size_bytes BIGINT | storage_key TEXT NOT NULL | thumbnail_key TEXT NULL | created_at |
Indexes: idx(task_id), idx(note_id). Constraint: exactly one of task_id/note_id is non-null.

### `templates`
| id PK | user_id FK | type TEXT NOT NULL | `day`/`task`/`routine` | name TEXT | category TEXT NULL | payload JSONB NOT NULL | serialized structure (blocks/tasks/subtasks) | created_at | updated_at |

### `smart_lists` (saved filters)
| id PK | user_id FK | name TEXT | filter_config JSONB | icon TEXT NULL | sort_order DOUBLE PRECISION | is_default BOOLEAN DEFAULT false | created_at | updated_at |

### `focus_sessions`
| id PK | user_id FK | task_id UUID NULL FK→tasks(id) ON DELETE SET NULL | started_at TIMESTAMPTZ | ended_at TIMESTAMPTZ NULL | planned_minutes INTEGER | actual_minutes INTEGER NULL | type TEXT DEFAULT 'work' | `work`/`break` | completed BOOLEAN DEFAULT false | created_at |
Indexes: idx(user_id, started_at), idx(task_id).

### `notifications`
| id PK | user_id FK | type TEXT NOT NULL | `task_reminder`/`habit_reminder`/`daily_summary`/`block_upcoming` | title TEXT | body TEXT | related_task_id UUID NULL FK→tasks | related_habit_id UUID NULL FK→habits | scheduled_for TIMESTAMPTZ NOT NULL | sent_at TIMESTAMPTZ NULL | read_at TIMESTAMPTZ NULL | snoozed_until TIMESTAMPTZ NULL | created_at |
Indexes: idx(user_id, scheduled_for), idx(user_id, read_at).

### `push_subscriptions`
| id PK | user_id FK | endpoint TEXT NOT NULL | p256dh TEXT | auth TEXT | user_agent TEXT | created_at |
Indexes: unique(endpoint).

### `quiet_hours`
| id PK | user_id FK | start_time TIME | end_time TIME | days_of_week SMALLINT[] | enabled BOOLEAN DEFAULT true |

### `task_history` (completion / status change audit log)
| id PK | task_id FK→tasks(id) ON DELETE CASCADE | user_id FK | event_type TEXT NOT NULL | `created`/`completed`/`uncompleted`/`rescheduled`/`status_changed` | from_value TEXT NULL | to_value TEXT NULL | occurred_at TIMESTAMPTZ NOT NULL DEFAULT now() |
Indexes: idx(task_id, occurred_at), idx(user_id, occurred_at) — backbone for statistics.

### `sync_queue` (server-side mirror of offline mutation log, optional for conflict audit)
| id PK | user_id FK | entity_type TEXT | entity_id UUID | operation TEXT (`create`/`update`/`delete`) | payload JSONB | client_updated_at TIMESTAMPTZ | applied_at TIMESTAMPTZ NULL | conflict BOOLEAN DEFAULT false | created_at |

### `data_exports`
| id PK | user_id FK | status TEXT (`pending`/`ready`/`failed`) | file_key TEXT NULL | requested_at | completed_at NULL |

## 5.2 Relationships Summary
- `users` 1—N most tables (owner relationship via `user_id`).
- `tasks` 1—N `tasks` (self-referencing parent/subtask).
- `tasks` N—M `tags` via `task_tags`.
- `tasks` 1—1..N `time_blocks` (a task can have one primary scheduled block, but model allows multiple for split scheduling).
- `habits` 1—N `habit_logs`, 1—N `time_blocks` (when a habit is placed on the timeline).
- `recurrences` 1—N `tasks` (generated instances) and 1—N `recurrence_exceptions`.
- `notes` N—1 `tasks` (optional), `attachments` N—1 `tasks` or `notes`.
- `calendars` 1—N `time_blocks` (externally sourced).
- `focus_sessions` N—1 `tasks`.
- `task_history` N—1 `tasks` (append-only audit trail powering Statistics).

## 5.3 Concurrency / Offline Sync Strategy
- Every mutable row carries `updated_at`. Client sends `If-Match`-style `updated_at` on update; server rejects with 409 + latest version if stale, client surfaces Conflict Resolution dialog (keep mine / keep server / merge fields).
- Soft delete via `deleted_at`; hard purge job runs daily for rows older than 30 days in trash.

---

# 6. API Design

REST/JSON API, base path `/api/v1`. Auth via `Authorization: Bearer <access_token>` (JWT, 15 min expiry) + httpOnly `refresh_token` cookie for refresh. All endpoints below require authentication and are scoped to the requesting user unless under `/auth`. Standard error shape: `{ "error": { "code": "string", "message": "string", "details": {} } }`.

## 6.1 Auth
| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| POST | /auth/signup | `{email,password,name}` | `201 {user, accessToken}` + sets refresh cookie | rate-limited |
| POST | /auth/login | `{email,password}` | `200 {user, accessToken}` | rate-limited |
| POST | /auth/oauth/google | `{idToken}` | `200 {user, accessToken}` | verifies Google ID token |
| POST | /auth/refresh | (cookie) | `200 {accessToken}` | rotates refresh token |
| POST | /auth/logout | — | `204` | clears cookie, revokes session |
| POST | /auth/logout-all | — | `204` | revokes all sessions |
| POST | /auth/forgot-password | `{email}` | `202` | sends reset email |
| POST | /auth/reset-password | `{token,newPassword}` | `200` | |
| GET | /me | — | `200 {user}` | current profile |
| PATCH | /me | `{name?,avatarUrl?,timezone?,weekStartDay?,timeFormat?,locale?,theme?,colorMode?}` | `200 {user}` | |
| DELETE | /me | `{password}` | `202` | queues full account purge |

## 6.2 Tasks
| Method | Path | Notes |
|---|---|---|
| GET | /tasks | query: `status,priority,tag,dateFrom,dateTo,parentTaskId,starred,smartListId,q,cursor,limit` → `200 {items, nextCursor}` |
| POST | /tasks | body: full task fields → `201 {task}` |
| GET | /tasks/:id | → `200 {task, subtasks, tags, attachments}` |
| PATCH | /tasks/:id | partial update, requires `updatedAt` for optimistic concurrency → `200 {task}` / `409 {latest}` |
| DELETE | /tasks/:id | soft delete → `204` |
| POST | /tasks/:id/restore | from trash → `200 {task}` |
| POST | /tasks/:id/complete | → `200 {task}` (writes task_history) |
| POST | /tasks/:id/uncomplete | → `200 {task}` |
| POST | /tasks/:id/duplicate | `{includeSubtasks:boolean}` → `201 {task}` |
| PATCH | /tasks/:id/reorder | `{sortOrder:number, parentTaskId?:uuid}` → `200` |
| POST | /tasks/bulk | `{ids:[uuid], action: 'complete'|'delete'|'tag'|'move', payload:{}}` → `200 {updated:number}` |
| GET | /tasks/trash | → `200 {items}` |
| DELETE | /tasks/trash | purge all → `204` |
| POST | /tasks/:id/dependencies | `{blockedByTaskId}` → `201` |
| DELETE | /tasks/:id/dependencies/:blockedByTaskId | → `204` |
| GET | /tasks/:id/history | → `200 {items}` |

## 6.3 Tags
| GET /tags | → list |
| POST /tags | `{name,color,emoji}` → `201` |
| PATCH /tags/:id | → `200` |
| DELETE /tags/:id | → `204` (cascades task_tags) |
| POST /tags/:id/merge | `{intoTagId}` → `200` |

## 6.4 Time Blocks / Timeline
| GET | /time-blocks?from=&to= | range query → `200 {items}` |
| POST | /time-blocks | `{taskId?,habitId?,title?,startAt,endAt,allDay?,color?}` → `201` |
| PATCH | /time-blocks/:id | move/resize → `200` (optimistic concurrency via `updatedAt`) |
| DELETE | /time-blocks/:id | → `204` |
| POST | /time-blocks/:id/duplicate | `{targetDate}` → `201` |
| GET | /time-blocks/next-available-slot | `{durationMinutes,date}` → `200 {startAt,endAt}` |

## 6.5 Calendars (Integration)
| GET | /calendars | list connected calendars |
| POST | /calendars/google/connect | `{oauthCode}` → `201 {calendar}` |
| POST | /calendars/ics | `{icsUrl,name,color}` → `201` |
| PATCH | /calendars/:id | `{visible?,color?,name?}` → `200` |
| DELETE | /calendars/:id | disconnect → `204` |
| POST | /calendars/:id/sync | manual sync trigger → `202` |
| GET | /calendars/export.ics | → `200 text/calendar` |

## 6.6 Habits
| GET | /habits?archived= | list |
| POST | /habits | create |
| GET | /habits/:id | detail + recent logs |
| PATCH | /habits/:id | update |
| DELETE | /habits/:id | archive (soft) |
| POST | /habits/:id/log | `{date,count?,isFreeze?}` → `201/200` upsert |
| DELETE | /habits/:id/log/:date | remove a log entry |
| GET | /habits/:id/stats | streaks, heatmap data |

## 6.7 Recurrences
| POST | /recurrences | `{rrule,startDate,endDate?,endCount?,taskTemplate}` → `201` generates initial instances |
| PATCH | /recurrences/:id | `{rrule?,endDate?,endCount?, scope:'future'|'all'}` |
| DELETE | /recurrences/:id | `{scope:'future'|'all'}` |
| POST | /recurrences/:id/exceptions | `{date, action:'skip'|'modified', modifiedTask?}` |

## 6.8 Notes
| GET | /notes?q=&taskId= | list/search |
| POST | /notes | create |
| GET | /notes/:id | detail |
| PATCH | /notes/:id | update |
| DELETE | /notes/:id | soft delete |
| POST | /notes/:id/restore | restore |

## 6.9 Attachments
| POST | /attachments | multipart upload, `{taskId?|noteId?}` → `201 {attachment}` (server generates signed storage key, uploads, returns metadata + thumbnail job queued) |
| GET | /attachments/:id/url | → `200 {signedUrl}` short-lived |
| DELETE | /attachments/:id | → `204` |

## 6.10 Templates
| GET | /templates?type= | list |
| POST | /templates | create from payload or `{fromDate}` to snapshot a day |
| PATCH | /templates/:id | update |
| DELETE | /templates/:id | delete |
| POST | /templates/:id/apply | `{targetDate, mergeStrategy:'merge'|'replace'}` → `201 {createdBlocks, createdTasks}` |

## 6.11 Smart Lists
| GET /smart-lists | list | POST /smart-lists | create | PATCH /smart-lists/:id | update | DELETE /smart-lists/:id | delete |

## 6.12 Focus Sessions
| POST | /focus-sessions | `{taskId?,plannedMinutes,type}` → `201 {session}` (starts) |
| PATCH | /focus-sessions/:id | `{action:'pause'|'resume'|'end'|'cancel'}` → `200` |
| GET | /focus-sessions?from=&to= | history |

## 6.13 Statistics
| GET | /stats/summary?from=&to= | completion %, focus time, streak summary |
| GET | /stats/duration-accuracy?from=&to= | estimate vs actual |
| GET | /stats/time-by-tag?from=&to= | breakdown |
| GET | /stats/trend?metric=&from=&to=&interval= | line series |
| GET | /stats/habit-heatmap/:habitId?from=&to= | heatmap data |
| POST | /stats/export | `{format:'csv'|'pdf', from, to}` → `202 {exportId}` then poll `GET /data-exports/:id` |

## 6.14 Notifications
| GET | /notifications?unread= | list |
| PATCH | /notifications/:id | `{readAt?,snoozedUntil?}` |
| POST | /push-subscriptions | register Web Push subscription |
| DELETE | /push-subscriptions/:id | unregister |
| GET/PATCH | /settings/quiet-hours | get/update |

## 6.15 Data Management
| POST | /data-exports | `{format:'json'}` → `202 {exportId}` |
| GET | /data-exports/:id | `200 {status, downloadUrl?}` |
| POST | /data-imports | multipart JSON upload → `202` |

## 6.16 Sync (Offline)
| POST | /sync/push | `{mutations:[{entityType,entityId,op,payload,clientUpdatedAt}]}` → `200 {results:[{id,status:'applied'|'conflict',server?}]}` |
| GET | /sync/pull?since= | `200 {changes:[...], serverTime}` incremental changes for IndexedDB hydration |

## 6.17 Authentication & Permissions Model
- All `/api/v1/*` except `/auth/*` require a valid access token; middleware injects `req.userId`.
- Every query filters `WHERE user_id = :userId`; no row ever returned cross-user (enforced both at the ORM query-builder layer and via PostgreSQL Row-Level Security policies as defense-in-depth).
- Since single-user today, there are no roles/permissions beyond "owner," but the `user_id` scoping is what future-proofs multi-tenancy.

---

# 7. Technical Architecture

## 7.1 Frontend
- **Framework**: React 18+ with TypeScript, using **Next.js** (App Router) for SSR of the marketing/login shell and CSR for the authenticated app, OR a pure Vite + React SPA if no public marketing site is desired — recommended: **Vite + React SPA** for a personal tool (simpler infra), with a static marketing page optional/skippable.
- **State/data layer**: TanStack Query (server cache, retries, optimistic updates) + Zustand for local UI state (theme, modals, drag state).
- **Drag & drop / timeline**: custom timeline built on top of `@dnd-kit/core` for drag interactions, with a hand-rolled time-grid renderer (virtualized for month view).
- **Rich text editor**: Tiptap (ProseMirror-based) for notes/descriptions, storing JSON doc.
- **Charts**: Recharts or visx for statistics visualizations.
- **Forms/validation**: React Hook Form + Zod schemas shared with backend.
- **Styling**: Tailwind CSS + CSS variables for theme tokens (supports light/dark + multiple themes via `data-theme` attribute).
- **Date/time & recurrence**: `date-fns` + `date-fns-tz`, `rrule.js` for RRULE parsing/generation.
- **PWA**: Workbox-generated service worker (precache app shell, runtime cache for API GETs, background sync for mutation queue).
- **Offline store**: IndexedDB via `idb` wrapper, mirroring server entities; a sync engine reconciles queued mutations against `/sync/push` and `/sync/pull`.
- **Command palette**: `kbar` or custom implementation.
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E).

## 7.2 Backend
- **Runtime/Framework**: Node.js + TypeScript with **NestJS** (or Fastify if a lighter framework is preferred) — recommended **NestJS** for its modular structure (matches the API's many bounded contexts: tasks, habits, calendar, notifications).
- **ORM**: Prisma (schema-first, matches the relational design in Section 5; generates type-safe client shared types with frontend via a shared `packages/types`).
- **Validation**: Zod or class-validator DTOs at controller boundaries.
- **Auth**: Passport.js strategies (local + Google OAuth2), JWT (access) + rotating refresh tokens stored hashed in `sessions`.
- **Background jobs**: BullMQ (Redis-backed) for: recurring task generation, notification scheduling/dispatch, calendar sync polling, thumbnail generation, nightly DB export/backup, trash purge.
- **Web Push**: `web-push` npm library with VAPID keys.
- **Calendar sync**: Google Calendar API client (OAuth2 + incremental sync via `syncToken`); ICS parsing via `ical.js` for read-only feeds.
- **Testing**: Jest (unit/integration), Supertest for API tests.

## 7.3 Database
- **Primary DB**: PostgreSQL 15+ (managed, e.g., RDS/Cloud SQL/Supabase/Neon).
- **Full-text search**: Postgres native `tsvector`/`tsvector` GIN indexes for notes/tasks (sufficient at single-user scale; avoids extra search infra).
- **Migrations**: Prisma Migrate, version-controlled.

## 7.4 Caching
- **Redis**: used for (a) BullMQ job queues, (b) short-TTL cache of expensive read endpoints (`/stats/*`), (c) rate-limiting counters, (d) refresh-token/session lookups.

## 7.5 Hosting & Deployment
- **Frontend**: static build deployed to Vercel/Netlify/Cloudflare Pages (CDN-distributed), or served from the same container as backend behind a reverse proxy for simplicity in a personal-project context.
- **Backend**: containerized (Docker), deployed to Fly.io / Railway / Render / a single small VM — recommended **Fly.io or Railway** for low-ops personal projects.
- **Database**: managed Postgres (Neon/Supabase/RDS) with automated backups + point-in-time recovery.
- **Object storage**: S3-compatible bucket (AWS S3, Cloudflare R2, or Supabase Storage) for attachments, with signed URLs.
- **CI/CD**: GitHub Actions — lint, typecheck, test, build, deploy on merge to `main`; preview deployments per PR.
- **Monitoring**: Sentry (frontend + backend error tracking), basic uptime monitor, structured logs (pino) shipped to a log sink.

## 7.6 Authentication
- Email/password (Argon2id hashing) + Google OAuth2.
- JWT access token (15 min) in memory/local storage avoided for XSS safety — kept in memory + silent refresh via httpOnly refresh cookie (SameSite=Lax, Secure).
- CSRF double-submit token for cookie-based refresh endpoint.

## 7.7 Storage
- Attachments → object storage bucket, key pattern `users/{userId}/attachments/{attachmentId}/{filename}`.
- Thumbnails generated async via background job (sharp) for images.

## 7.8 Cron Jobs (BullMQ repeatable jobs)
- `recurrence:materialize` — nightly, generates next window of task instances from active recurrences.
- `notifications:dispatch` — every minute, sends due notifications via Web Push.
- `calendar:sync` — every 15 min per connected calendar (or webhook-driven for Google push notifications channel).
- `backup:nightly` — nightly full data export snapshot to object storage.
- `trash:purge` — daily, hard-deletes soft-deleted rows older than 30 days.
- `exports:process` — on-demand queue consumer for CSV/PDF/JSON export requests.

## 7.9 Push Notifications
- Web Push (VAPID) for browser notifications, subscription managed via `push_subscriptions` table; service worker `push` event renders notification with actions (Snooze/Done) wired to background fetch calls.

---

# 8. Folder Structure

```
flowline/
├── apps/
│   ├── web/                         # Frontend (Vite + React + TS)
│   │   ├── src/
│   │   │   ├── app/                 # Route components/pages
│   │   │   │   ├── today/
│   │   │   │   ├── calendar/
│   │   │   │   ├── tasks/
│   │   │   │   ├── habits/
│   │   │   │   ├── notes/
│   │   │   │   ├── statistics/
│   │   │   │   ├── templates/
│   │   │   │   ├── settings/
│   │   │   │   └── auth/
│   │   │   ├── components/
│   │   │   │   ├── timeline/
│   │   │   │   ├── task/
│   │   │   │   ├── habit/
│   │   │   │   ├── notes/
│   │   │   │   ├── command-palette/
│   │   │   │   ├── dialogs/
│   │   │   │   └── ui/              # design-system primitives
│   │   │   ├── hooks/
│   │   │   ├── stores/              # zustand stores
│   │   │   ├── lib/                 # api client, rrule helpers, date utils
│   │   │   ├── offline/             # IndexedDB schema + sync engine
│   │   │   ├── service-worker/
│   │   │   ├── styles/              # tailwind config, theme tokens
│   │   │   └── main.tsx
│   │   ├── public/
│   │   └── vite.config.ts
│   └── api/                         # Backend (NestJS + TS)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── tasks/
│       │   │   ├── tags/
│       │   │   ├── time-blocks/
│       │   │   ├── calendars/
│       │   │   ├── habits/
│       │   │   ├── recurrences/
│       │   │   ├── notes/
│       │   │   ├── attachments/
│       │   │   ├── templates/
│       │   │   ├── smart-lists/
│       │   │   ├── focus-sessions/
│       │   │   ├── statistics/
│       │   │   ├── notifications/
│       │   │   ├── sync/
│       │   │   └── data-management/
│       │   ├── jobs/                # BullMQ processors
│       │   ├── common/              # guards, interceptors, filters, decorators
│       │   ├── prisma/
│       │   │   └── schema.prisma
│       │   └── main.ts
│       └── test/
├── packages/
│   ├── types/                       # shared TS types/DTOs/Zod schemas
│   └── config/                      # shared eslint/tsconfig
├── docs/
│   └── PRODUCT_DESIGN_DOCUMENT.md   # this document
├── .github/workflows/
│   └── ci.yml
├── docker-compose.yml                # local Postgres + Redis
├── package.json                      # workspaces root
└── README.md
```

---

# 9. Development Roadmap

20 independently testable milestones. Each milestone ends in a demoable, verifiable state.

**M1 — Project Scaffolding & CI**
Monorepo workspaces set up; Next/Vite frontend skeleton; NestJS backend skeleton; Prisma connected to local Postgres via docker-compose; GitHub Actions running lint/typecheck/test on push.
*Test*: `npm run dev` boots both apps; CI pipeline passes on an empty PR.

**M2 — Auth & User Account**
Signup/login/logout, JWT + refresh cookie flow, Google OAuth, password reset email flow, `/me` profile endpoints.
*Test*: Can sign up, log out, log back in, reset password, and edit profile via API + a minimal login UI.

**M3 — Core Task CRUD**
`tasks` table, full CRUD API, basic Tasks list page (no drag-drop yet), task detail dialog with title/description/priority/due date.
*Test*: Create/edit/delete/complete a task end-to-end through the UI.

**M4 — Subtasks & Tags**
Nested subtasks (recursive UI), tag CRUD + multi-select on tasks, tag management page.
*Test*: Create a task with 3 nested subtasks and 2 tags; verify progress ring updates as subtasks complete.

**M5 — Timeline Foundation (Read-Only)**
`time_blocks` table + API, Today page renders a static vertical timeline for the current day from existing blocks, "now" line.
*Test*: Seed blocks via API; confirm they render at correct times on the timeline.

**M6 — Timeline Drag & Drop**
Drag-create, drag-move, drag-resize blocks; drag a task from inbox onto timeline; optimistic concurrency on PATCH.
*Test*: Manually drag a block to a new time/duration and confirm persistence after reload.

**M7 — Week & Month Calendar Views**
Week view (multi-day timeline), month grid view, navigation between views, mini calendar in sidebar.
*Test*: Navigate Day→Week→Month and back; verify same blocks render consistently across views.

**M8 — Recurring Tasks & RRULE Engine**
`recurrences` + `recurrence_exceptions` tables, RRULE builder dialog, nightly materialization job, edit-this-vs-all-future flow.
*Test*: Create a "every weekday" recurring task; confirm next 14 days' instances exist and skipping one occurrence works.

**M9 — Habits Module**
Habits CRUD, daily check-in, streak calculation, heatmap visualization, habit detail dialog.
*Test*: Create a habit, log 5 consecutive days (via API timestamps or UI), confirm streak = 5 and heatmap reflects it.

**M10 — Templates & Routines**
Day templates (snapshot/apply), task templates, routines (recurring block sets) tied into recurrence engine.
*Test*: Save today as a template, apply it to a future date, confirm blocks/tasks are created without duplicating existing ones.

**M11 — Notes & Rich Text**
Tiptap integration for task descriptions and standalone notes, Notes page master-detail, autosave.
*Test*: Write a formatted note (headings, lists, checkboxes), reload, confirm formatting persists.

**M12 — Attachments**
Object storage integration, upload/download/delete flow, thumbnail generation job.
*Test*: Upload an image to a task, see thumbnail render, download via signed URL, delete it.

**M13 — Search, Filters & Smart Lists**
Global search/command palette, multi-criteria filters, saved Smart Lists, default lists (Today/Overdue/etc).
*Test*: Cmd+K search finds a task by partial title; create and revisit a custom Smart List filter.

**M14 — Focus Mode & Time Tracking**
`focus_sessions` table, Pomodoro timer UI, full-screen focus overlay, actual-duration rollup to tasks.
*Test*: Run a 1-minute test focus session on a task; confirm `actual_minutes` increments and session appears in history.

**M15 — Statistics Dashboard**
`task_history` audit logging wired into all task mutations, stats endpoints, charts (trend/pie/bar/heatmap), CSV/PDF export.
*Test*: Complete several tasks across a few days; confirm dashboard charts and exported CSV match expected numbers.

**M16 — Notifications & Push**
Web Push subscription flow, notification scheduling job, in-app notification center, quiet hours, snooze/done actions from notification.
*Test*: Schedule a task 2 minutes out; receive a real browser push notification; mark done from it.

**M17 — Google Calendar & ICS Integration**
OAuth connect flow, two-way sync job, ICS subscribe/export, calendar layer toggles, conflict indicator.
*Test*: Connect a real Google account; create an event in Google Calendar; confirm it appears in Flowline within one sync cycle, and vice versa.

**M18 — Theming, Accessibility & Keyboard Shortcuts**
Light/dark/system mode, 5 curated themes, full keyboard shortcut set + cheat sheet dialog, accessibility audit pass (axe-core in CI).
*Test*: Toggle through all themes and modes; complete a full task-creation flow using only the keyboard; axe-core reports zero critical violations.

**M19 — Offline & PWA**
Service worker, IndexedDB mirror, mutation queue + `/sync/push`/`/sync/pull`, install manifest, conflict resolution dialog.
*Test*: Go offline (DevTools), create/edit/complete tasks, go back online, confirm all changes synced without data loss; install app as PWA on mobile.

**M20 — Hardening, Backups & Launch Readiness**
Rate limiting, security headers, automated nightly backup job + restore drill, full JSON export/import, trash purge job, account deletion flow, load/perf pass, final responsive/mobile QA across all pages.
*Test*: Trigger a manual backup, restore it into a fresh DB and verify data integrity; run a Lighthouse audit scoring ≥90 on Performance/Accessibility/PWA/Best Practices.

---

# 10. Future Enhancements

Beyond v1 scope; candidates for v2+ (100 ideas):

1. AI-powered auto-scheduling (fits unscheduled tasks into free slots intelligently).
2. AI natural-language task creation via LLM (beyond simple parsing).
3. AI daily/weekly review summaries.
4. AI-suggested task breakdown into subtasks.
5. AI estimate suggestions based on historical duration accuracy.
6. Voice input for quick-add.
7. Native mobile apps (iOS/Android) via React Native or Capacitor wrapper.
8. Native desktop app via Electron/Tauri.
9. Apple Calendar (CalDAV) integration.
10. Outlook/Microsoft 365 Calendar integration.
11. Multi-user collaboration / shared projects.
12. Task assignment to other people (delegation).
13. Real-time collaborative editing on shared notes.
14. Comments/discussion threads on tasks.
15. Team/workspace concept with roles and permissions.
16. Public task/calendar sharing via read-only link.
17. Kanban board view for tasks.
18. Gantt chart / project timeline view.
19. Goal-setting module (OKRs linked to tasks/habits).
20. Habit "chains"/bundles (group habits into a routine streak).
21. Mood/energy tracking correlated with productivity stats.
22. Journaling module with daily prompts.
23. Pomodoro leaderboard / personal best tracking.
24. Location-based reminders (geofencing).
25. Apple Watch / Wear OS companion app.
26. Widget support (home screen widgets for today's schedule).
27. Siri Shortcuts / Google Assistant integration.
28. Zapier/IFTTT/Make integration.
29. Email-to-task capture (forward an email to create a task).
30. Browser extension for quick capture from any webpage.
31. Slack/Discord integration for reminders.
32. Time-zone travel mode (auto-adjust schedule when traveling).
33. Energy-based scheduling (suggest deep work during peak energy hours).
34. Custom RRULE templates marketplace/sharing.
35. Theming marketplace (community-created themes).
36. Public API + developer documentation for third-party integrations.
37. Webhooks for task/habit events.
38. Two-factor authentication (TOTP/WebAuthn).
39. Biometric unlock on mobile/PWA.
40. End-to-end encryption option for notes/attachments.
41. Local-only mode (no cloud sync, fully on-device).
42. Multi-device live cursor/presence (if collaboration added).
43. Recurring budget/finance tracking integration.
44. Meal planning module.
45. Workout/fitness plan templates linked to habits.
46. Sleep tracking integration (via wearable APIs).
47. Integration with Apple Health / Google Fit.
48. Smart "best time to schedule" ML model based on completion history.
49. Drag-and-drop email attachments directly into tasks.
50. Offline-first conflict-free replicated data type (CRDT) sync engine upgrade.
51. Custom dashboard builder (drag-and-drop widgets).
52. Annual review / "year in review" auto-generated report.
53. Habit "why" notes (motivation reminder shown on check-in).
54. Task templates with conditional logic (if X then add Y subtask).
55. Recurring task "snooze whole series" option.
56. Multiple timezones displayed simultaneously on timeline (for remote teams/travel).
57. Custom working hours / availability blocks shown distinctly on timeline.
58. Auto-archive completed projects after N days.
59. Tag hierarchies (nested tags/categories).
60. Smart duplicate-detection when creating similar tasks.
61. Bulk import from Todoist/Things/Notion/Trello.
62. CSV bulk task import.
63. Public roadmap/changelog page for the app itself.
64. In-app feedback/feature-request board.
65. Custom notification sounds.
66. Notification digest mode (batch instead of per-event).
67. "Do not disturb" calendar-aware mode (auto-mute during meetings).
68. Read-only "presentation mode" for sharing your day in a meeting.
69. Custom emoji upload (beyond standard emoji set).
70. Animated theme transitions / seasonal theme packs.
71. Accessibility: screen-reader optimized timeline mode (list fallback).
72. Multi-language i18n support.
73. Offline map of "where I was" tagged to time blocks (location journal).
74. Auto-detect idle time and suggest filling it.
75. Smart conflict auto-resolution suggestions for calendar overlaps.
76. Recurring "review" tasks auto-generated weekly (e.g., "Weekly planning session").
77. Habit difficulty rating with adaptive streak rewards/gamification (XP, levels).
78. Achievement badges for milestones (100-day streak, etc.).
79. Social accountability (share streaks with a friend, opt-in).
80. Custom keyboard shortcut remapping UI.
81. Vim-style keybindings mode.
82. Command palette plugin system (custom actions).
83. Markdown import/export for notes.
84. Note linking (wiki-style `[[note]]` backlinks).
85. Graph view of linked notes/tasks.
86. Full offline-capable mobile-installed app with background sync via periodic background sync API.
87. Smart notification timing (ML-adjusted based on responsiveness).
88. "Focus playlist" integration with Spotify/Apple Music.
89. Custom themes per time-of-day (auto dark mode at sunset using geolocation).
90. Quick capture via SMS/WhatsApp bot.
91. Calendar "heatmap" overlay showing historical busyness when picking new times.
92. Subtask templates with auto-assigned relative due dates (e.g., "3 days before parent due").
93. Recurring habit "vacation mode" (pause without breaking streak logic).
94. Custom report builder (choose your own metrics/charts, save as a dashboard).
95. Multi-currency time-value tracking (estimate cost of time spent per tag).
96. Read-it-later/article clipper integrated as a task type.
97. Integration with project management tools (Jira/Linear) for cross-posting tasks.
98. On-device AI model option for privacy-conscious natural language parsing (no cloud LLM call).
99. Customizable onboarding checklist/tutorial for new users.
100. White-label/self-host distribution (Docker Compose one-click deploy for other single users).

---

*End of document.*
