# app-foundations Specification

## Purpose

Defines global CSS, focus styles, reduced motion, viewport, skip link, landmarks, strings module, VisuallyHidden component, and console-clean guarantees.

## ADDED Requirements

### Requirement: Global CSS foundation
Minimal reset, `box-sizing: border-box`, font-family exactly `Helvetica, Arial, sans-serif`, `font-weight: 300`, white background, text color from token, small base font size from tokens. No font files bundled.

#### Scenario: Base styles applied
- **WHEN** the app loads
- **THEN** the base typography and colors use the defined tokens and the exact font stack

### Requirement: Link and button focus styles
Header links have no underline by default. A consistent visible `:focus-visible` style (2px solid outline in text color with 2px offset) is applied. Focus is never removed without a replacement.

#### Scenario: Focus-visible styles
- **WHEN** tabbing to an interactive element
- **THEN** a visible focus style is shown (2px solid outline, 2px offset)

#### Scenario: Header links no underline by default
- **WHEN** rendering header links
- **THEN** they have no text-decoration by default

### Requirement: Reduced motion
`prefers-reduced-motion: reduce` disables transitions and animations globally.

#### Scenario: Reduced motion respected
- **WHEN** the user prefers reduced motion
- **THEN** all transitions and animations are disabled

### Requirement: Viewport not zoom-locked
The viewport meta MUST NOT include `maximum-scale` or `user-scalable=no`.

#### Scenario: Viewport allows zoom
- **WHEN** index.html is rendered
- **THEN** viewport is `width=device-width, initial-scale=1.0` (no zoom-lock)

### Requirement: Skip link
A "Skip to content" link is the first focusable element. It is hidden until focused, then visible, and moves focus to the `main` region (`id="main"`, `tabindex="-1"`).

#### Scenario: Skip link first element
- **WHEN** tabbing from the start of page
- **THEN** the skip link receives focus first

#### Scenario: Skip link becomes visible on focus
- **WHEN** the skip link receives focus
- **THEN** it becomes visible

#### Scenario: Skip link moves focus to main
- **WHEN** activating the skip link
- **THEN** focus moves to the element with id `main` (which has `tabindex="-1"`)

### Requirement: Landmarks
There is exactly one `<header>` and exactly one `<main>`. No duplicated landmarks.

#### Scenario: Exactly one header
- **WHEN** on any route
- **THEN** exactly one `<header>` exists

#### Scenario: Exactly one main
- **WHEN** on any route
- **THEN** exactly one `<main>` exists

### Requirement: HTML lang
`html` has `lang="en"`.

#### Scenario: Lang attribute
- **WHEN** index.html is rendered
- **THEN** `<html lang="en">` is present

### Requirement: Strings module
UI strings live in `apps/web/src/shared/strings.ts` with the strings needed by this change.

#### Scenario: Strings module exists
- **WHEN** the app builds
- **THEN** `shared/strings.ts` exists with the required strings

### Requirement: VisuallyHidden component
A shared `VisuallyHidden` component renders text only for assistive technology.

#### Scenario: VisuallyHidden component exists
- **WHEN** building
- **THEN** `shared/components/VisuallyHidden` (or equivalent) is present

### Requirement: Console clean
The app MUST NOT produce console errors or warnings in dev or production. Specifically: no 404 for `/favicon.ico`, and no router future-flag warnings.

#### Scenario: No favicon 404
- **WHEN** the app loads
- **THEN** there is no 404 request for `/favicon.ico`

#### Scenario: No router future-flag warnings
- **WHEN** the app loads
- **THEN** no react-router v6 future-flag warnings appear in the console
