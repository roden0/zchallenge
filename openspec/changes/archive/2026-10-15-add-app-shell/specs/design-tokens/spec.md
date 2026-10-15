# design-tokens Specification

## Purpose

Defines the CSS design tokens as CSS variables on `:root`, breakpoint strategy, and that [CONFIRM] values are not invented.

## ADDED Requirements

### Requirement: Tokens live in tokens.css
All design tokens MUST live in `apps/web/src/styles/tokens.css` as CSS variables on `:root`.

#### Scenario: Tokens file exists
- **WHEN** building the app
- **THEN** tokens are loaded from `styles/tokens.css`

### Requirement: Core colors and states
The following colors MUST be defined as CSS variables: `--color-text`, `--color-text-secondary`, `--color-text-placeholder`, `--color-border-control`, `--color-content-disabled`, `--color-bg-disabled`, `--color-danger`.

#### Scenario: Color tokens present
- **WHEN** tokens.css is loaded
- **THEN** the seven color tokens are defined with the exact values from design notes

### Requirement: Typography scale
The type scale MUST include `--font-size-10`, `--font-size-12`, `--font-size-14`, `--font-size-16`, `--font-size-20`, `--font-size-24` (all in px). Font weight 300 (`--font-weight-light` or explicit `font-weight: 300` usage) is defined.

#### Scenario: Type scale tokens present
- **WHEN** tokens.css is loaded
- **THEN** the six font-size tokens and light weight are defined

### Requirement: Layout and motion tokens
`--header-height`, `--duration-hover`, `--easing-hover` MUST be defined.

#### Scenario: Layout and motion present
- **WHEN** tokens.css is loaded
- **THEN** header height 80px, hover duration 1000ms, easing ease-in-out are defined

### Requirement: Page padding per breakpoint
Page padding tokens or explicit values: `--page-padding-mobile` (16px), `--page-padding-tablet` (40px), `--page-padding-desktop` (100px).

#### Scenario: Page padding tokens
- **WHEN** tokens.css is loaded
- **THEN** mobile 16px, tablet 40px, desktop 100px are defined

### Requirement: Breakpoints
Breakpoints are mobile-first at `600px` (tablet) and `1024px` (desktop). CSS variables cannot be used inside `@media`, so literal values are used and documented in a comment next to the tokens.

#### Scenario: Breakpoints documented
- **WHEN** reading tokens.css
- **THEN** a comment documents breakpoints 600px and 1024px and the mobile-first strategy

#### Scenario: Media queries use literals
- **WHEN** media queries are defined
- **THEN** they use literal 600px and 1024px values (not CSS variables)

### Requirement: Do not invent [CONFIRM] values
Tokens MUST NOT be created for values marked `[CONFIRM]` or missing in design-notes (card/table border color, enabled button color, selected states). They remain undefined until a feature needs them.

#### Scenario: No invented values
- **WHEN** defining tokens
- **THEN** only the exact, specified tokens are present; missing [CONFIRM] values are omitted
