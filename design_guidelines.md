# Design Guidelines: AI Supervisor Dashboard

## Design Approach

**Selected Approach:** Design System - Linear/Productivity Focused

**Justification:** This is a utility-focused internal tool where efficiency, clarity, and quick decision-making are paramount. The supervisor needs to process help requests rapidly, provide answers, and monitor system performance without visual distractions.

**Key Design Principles:**
- Information density with breathing room
- Clear visual hierarchy for request states
- Instant feedback for all actions
- Minimal cognitive load for rapid processing

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 220 15% 8% (deep slate)
- Surface: 220 15% 12% (elevated cards)
- Border: 220 10% 20% (subtle dividers)
- Text Primary: 0 0% 95%
- Text Secondary: 220 5% 65%

**Status Colors:**
- Pending: 45 90% 60% (amber warning)
- Resolved: 142 70% 50% (success green)
- Timeout: 0 70% 60% (error red)
- Processing: 217 90% 60% (info blue)

**Accent (Minimal Use):**
- Primary Action: 217 90% 55% (blue for CTAs)
- Hover State: 217 90% 65%

### B. Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - clean, readable sans-serif
- Monospace: JetBrains Mono (for timestamps, IDs)

**Type Scale:**
- Page Title: text-2xl font-semibold
- Section Headers: text-lg font-medium
- Card Titles: text-base font-medium
- Body Text: text-sm
- Metadata: text-xs text-gray-400
- Timestamps: text-xs font-mono

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 or p-6
- Card spacing: gap-4
- Section margins: mb-8
- Form field gaps: gap-2

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-4
- Two-column layout: lg:grid-cols-[1fr_400px] (main content + knowledge base sidebar)
- Request cards: Grid with gap-4

### D. Component Library

**Navigation:**
- Top bar with logo, page title, and user avatar
- Height: h-16
- Sticky positioning with backdrop blur
- Minimal, functional design

**Request Cards:**
- Rounded corners: rounded-lg
- Border: border border-gray-800
- Padding: p-6
- Status badge in top-right corner
- Customer info with monospace phone number
- Question displayed prominently
- Timestamp at bottom
- Response form revealed on "Answer" button click

**Status Badges:**
- Rounded-full px-3 py-1
- Text-xs font-medium
- Color-coded by status (Pending/Resolved/Timeout)
- Subtle background with bright text

**Forms:**
- Textarea for supervisor answers: min-h-32
- Dark input backgrounds: bg-gray-900
- Border on focus: focus:ring-2 ring-blue-500
- Submit button: Full-width, primary blue
- Character counter below textarea

**Knowledge Base Panel:**
- Fixed sidebar on desktop (lg:sticky lg:top-20)
- Collapsed accordion items showing Q&A pairs
- Search bar at top
- Monospace timestamps for learned date
- Subtle hover states on items

**Empty States:**
- Centered icon and message
- "No pending requests" with checkmark icon
- Subtle gray illustration or icon

### E. Interactions & Feedback

**Animations:** Minimal and purposeful only
- Request card appearance: Simple fade-in
- Status change: Subtle color transition (200ms)
- Form submission: Button loading state with spinner
- NO scroll animations or decorative effects

**Loading States:**
- Skeleton screens for initial load
- Inline spinners for actions
- Disabled state on buttons during processing

**Success Feedback:**
- Toast notification: "Answer sent to customer"
- Request card smoothly transitions to "Resolved" state
- Green check icon animation (subtle)

## Layout Structure

**Main Dashboard View:**
1. Top Navigation Bar (sticky)
2. Page Header with stats ("3 Pending Requests")
3. Filter/Sort controls (Tabs: All, Pending, Resolved)
4. Two-column layout:
   - Left: Request cards in vertical stack
   - Right: Knowledge Base sidebar (sticky)
5. Each request card contains:
   - Status badge
   - Customer name/phone (monospace)
   - Question text (slightly larger)
   - Timestamp (bottom-left, small)
   - Action button (bottom-right)

**Request Detail/Answer State:**
- Card expands vertically
- Textarea appears below question
- Character counter
- Submit button
- "Sorry for the delay" message preview shown

**Knowledge Base Sidebar:**
- Search input at top
- "Recently Learned" section (5 most recent)
- Scrollable list of Q&A pairs
- Each entry: Question (bold) + Answer (gray text)
- Timestamp in monospace

## Accessibility

- Consistent dark mode implementation (no light mode needed for internal tool)
- Form inputs with dark backgrounds: bg-gray-900
- Sufficient contrast ratios (WCAG AA)
- Keyboard navigation support
- Focus indicators on all interactive elements
- Screen reader labels for status badges

## Images

**No hero images needed** - this is a utility dashboard, not a marketing page.

**Icons Only:**
- Use Heroicons (outline style) via CDN
- Status indicators: CheckCircle, Clock, XCircle
- Knowledge base: BookOpen, Search
- Actions: PaperAirplane (send), Plus (add)

## Key UI Behaviors

**Real-time Updates:**
- When supervisor submits answer: Card instantly shows "Processing" state
- On success: Smooth transition to "Resolved" with green badge
- Toast: "Answer sent to customer and knowledge base updated"

**Request Lifecycle Visualization:**
- Pending: Amber badge, "Answer" button visible
- Processing: Blue badge, loading spinner
- Resolved: Green badge, collapsed state with checkmark
- Timeout: Red badge, "Expired" label

**Data Density:**
- Show 10-15 requests per page
- Pagination at bottom (simple numbers, no fancy controls)
- Keep information scannable with clear typography hierarchy

This design creates a focused, professional supervisor interface that prioritizes speed and clarity over visual flair - perfect for the high-stakes, time-sensitive nature of customer support escalations.