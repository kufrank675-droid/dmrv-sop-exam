# Design

## Visual System

DMRV SOP Exam uses a restrained operations-console style: cool neutral surfaces, strong ink text, blue as the single primary action color, green only for verified/completed states, and amber only for caution or pending review.

## Colors

- Background: `oklch(0.965 0.006 250)`
- Surface: `oklch(1 0 0)`
- Raised surface: `oklch(0.985 0.004 250)`
- Ink: `oklch(0.21 0.035 255)`
- Muted ink: `oklch(0.45 0.03 255)`
- Primary: `oklch(0.52 0.18 260)`
- Primary strong: `oklch(0.42 0.18 260)`
- Verified: `oklch(0.54 0.14 165)`
- Caution: `oklch(0.72 0.13 78)`
- Border: `oklch(0.9 0.012 250)`

## Typography

Use a system sans stack for all UI. Use tabular numerals for metrics, timers, and scores. Keep headings compact; this is a product tool, not a landing page.

## Components

- Navigation: persistent sidebar on desktop, compact two-column nav on mobile.
- Metrics: compact ledger tiles with labels, values, and status notes.
- Questions: one focused question panel with stable option rows and clear selected state.
- Bank records: dense list cards with answer, SOP location, difficulty, and source metadata.
- Results: audit-log style rows with timestamp, score, mode, and completion count.

## Interaction

Transitions should be 150-220ms and communicate state only. Buttons, tabs, nav items, options, and list rows all need hover/focus/active states. Reduced motion disables non-essential transitions.
