## 2025-05-04 - Missing ARIA Labels on Close Buttons and Icon-Only Actions
**Learning:** Many interactive dialogs, modal panels, and list actions in the codebase (like the `&times;` close buttons in `SelectionModal`, `FilterPanel`, `BuildActions`, and emoji buttons for load/edit/delete) lacked `aria-label` attributes. While some had a visual `title`, they still needed explicit `aria-label` attributes to ensure consistent screen reader support.
**Action:** When auditing or building new components, always verify that icon-only buttons (`✕`, `&times;`, emojis) include explicit and descriptive `aria-label` attributes, in French, to meet accessibility standards and enhance the overall UX.

## 2025-05-18 - Missing ARIA Labels on Search Input Clear Button
**Learning:** The search bar component's clear button (`✕`) was an icon-only button without an explicit `aria-label`. This made the function of the button unclear to screen reader users when navigating the component.
**Action:** When implementing or modifying custom input components (like search bars), ensure all interactive elements, particularly icon-only clear buttons, include an explicit `aria-label` (and optionally a `title`) to provide essential context for accessibility. Added `aria-label="Effacer la recherche"` to the clear button.
