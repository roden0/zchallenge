# Design notes

Visual and interaction reference derived from the Figma file (screens plus Dev Mode values). Read this before building or changing any UI.

> Values marked **(Dev Mode)** were read from Figma's inspector and are exact. Values marked **(≈)** were measured from screenshots and are approximate. Items marked **[CONFIRM]** must be checked before being treated as final. Never eyeball a value that is missing: ask.

## Global

- Font in Figma: **Helvetica Neue, weight 300 (Light)**, line height 100%, letter spacing 0% (except the add button). The challenge mandates `font-family: Helvetica, Arial, sans-serif`, so use exactly that stack with `font-weight: 300`. Do not bundle a font. Rendering will vary by OS: Helvetica Light exists on macOS, but Arial (Windows) and the usual Linux substitutes have no Light weight and will show Regular. Mention it in the README as a known trade-off.
- Palette: monochrome, plus a red for "Eliminar". No shadows or radii visible.
- Frames: desktop **1920**, tablet **834**, mobile **393**. Horizontal page padding: **100px** on desktop (exact, content 1720), **≈40px** on tablet and **≈16px** on mobile (approximate: measured from screenshots now that the frame widths are known). Header, search, grid and cart share it.
- **Header** (Dev Mode: 1920 × 80, and **80px high at every width**, confirmed by the human): logo on the left (link to `/`), bag icon + count on the right (link to `/cart`). It is a single `Header` component in Figma and is **identical on every view, cart included** (human decision). The bag icon is outline at 0 items (`bag_inactive.svg`) and filled at 1 or more (`bag_active.svg`).
- Icons are imported as asset URLs and rendered with `<img alt="">` inside the link or button that carries the accessible name (for example `aria-label="Cart, 2 items"`). Do not add an SVG plugin without asking.
- The back chevron and the clear `×` are text characters. Mark the glyph `aria-hidden="true"` and give the control its accessible name: the clear control is a `<button type="button" aria-label="Clear search">` that also returns focus to the input, and the back link's name is the text `BACK`.
- The header is **not sticky**: it scrolls away with the page (human decision, it overrides the FIXED layer names in the Figma).
- Price format: `1099 EUR` (no thousands separator, `EUR` suffix). Real data has decimals (`959.42`), so show decimals only when present, with a comma separator (`959,42 EUR`) **[proposed, see api-notes.md]**. One shared formatter. Compute cart totals in integer cents.
- Storage capacity text comes as `128 GB` or `128GB`. Display it normalized with a space (`128 GB`), but keep the raw value for identity.
- UI copy is hard-coded and mixes English and Spanish in Figma. Keep all strings in one module (`shared/strings.ts`), no i18n library. Copy as in Figma:

| Where | String |
|---|---|
| Search placeholder | `Search for a smartphone...` |
| Counter | `{n} RESULTS` (handle singular) |
| Detail back link | `< BACK` |
| Detail price | `From {price} EUR` before storage is chosen, `{price} EUR` after |
| Storage label | `STORAGE ¿HOW MUCH SPACE DO YOU NEED?` |
| Color label | `COLOR. PICK YOUR FAVOURITE.` |
| Add button | `AÑADIR` |
| Sections | `SPECIFICATIONS`, `SIMILAR ITEMS` |
| Cart title | `CART ({n})` |
| Remove | `Eliminar` |
| Cart footer | `CONTINUE SHOPPING`, `TOTAL {price} EUR`, `PAY` |

## Design tokens (Dev Mode)

Figma names its color styles `SDS/...`. Mirror that in CSS variable names. Put them in `apps/web/src/styles/tokens.css`.

**Colors**

| Token | Value | Used for |
|---|---|---|
| `--color-text` | `#000000` | Names, prices, titles, storage labels |
| `--color-text-secondary` | `#79736D` | Brand label on cards |
| `--color-text-placeholder` | `#AAAAAA` | Search placeholder |
| `--color-border-control` | `#CCCCCC` | Color swatch border (unselected) |
| `--color-content-disabled` (`SDS/Content/States/Disabled`) | `#C2BFBC` | Disabled add button label |
| `--color-bg-disabled` (`SDS/Background/States/Disabled`) | `#F3F2F2` | Disabled add button background |
| `--color-danger` | `#DF0000` | `Eliminar` |

Confirmed (add-product-detail): enabled primary button (`PAY`, enabled add) `#000000` (`--color-bg-primary`); selected-state borders — storage option selected `1px #000000` (`--color-border-selected`), unselected `1px #CCCCCC` (`--color-border-control`), color swatch selected outline `1px #000000`. Still **[CONFIRM]**: page background (assumed `#FFFFFF`), table border color (using `--color-border-control`), hover fill (assumed `#000000`). Card border `#000000`, search underline `#000000` confirmed.

**Typography** (all Helvetica Neue Light 300, line height 100%, letter spacing 0% unless stated)

| Text | Size | Case | Notes |
|---|---|---|---|
| Search input / placeholder | 16px | as typed | input height 19px |
| Card brand | 10px | uppercase | `--color-text-secondary` |
| Card name | 12px | uppercase | |
| Card price | 12px | as typed | right-aligned |
| Detail title | 24px | uppercase | |
| Detail price | 20px | title case (`From 1099 EUR`) | |
| Storage option | 14px | title case | |
| Add button label | 12px | uppercase | line height 16px, **letter spacing 8%**, centered |
| `Eliminar` | 12px | as typed | `--color-danger` |

Confirmed (add-product-detail): section titles 20px uppercase; specifications labels 12px uppercase and values 12px; storage/color legends 14px uppercase; selected color name 12px capitalized; back link 12px uppercase. The results counter is captured in the catalog section below. Still **[CONFIRM]**: cart title and footer text.

**Sizes and layout**

- Desktop frame 1920px, header height 80px, horizontal padding 100px.
- Catalog grid: 5 columns over 1720px, so **cards are 344px wide and roughly square (≈)**. Search input is full grid width.
- Detail (confirmed in add-product-detail): the content sits in a centered container of **1200px**, with the image area **510px** on the left and the info column **380px** on the right, leaving **310px** between them (`justify-content: space-between`). Tablet keeps the info column at **380px**; mobile stacks both full width. Add button **380 × 56px** (fills the info column). Specifications label column **300px** on desktop and tablet, fluid on mobile, rows **≈46px** (mobile width and exact row height still **[CONFIRM]**).
- Color swatch: **24 × 24px**, 1px `#CCCCCC` border. Gap between swatches **[CONFIRM]**: the component says 10px, the visible spacing looks larger (≈16px).
- Cart: buttons are **≈260 × 56px**, `CONTINUE SHOPPING` at the left padding edge, `PAY` at the right padding edge.
- Breakpoints (proposed, mobile-first, the design only shows three widths): mobile base up to 599px (1 column, padding ≈16px), tablet from 600px (2 columns, padding ≈40px), desktop from 1024px (5 columns, padding 100px). Between designed widths the layout stays fluid. At 1024px desktop cards are about 165px wide, so the card info row must wrap (name above price) instead of overflowing. **[CONFIRM]**

## Catalog list

- Search: underline-only input (no box), placeholder above. Below it, the counter in uppercase small text.
- A **clear button (×)** appears at the right end of the input only when it has text.
- Grid of cards with 1px borders. Columns: **5 on desktop, 2 on tablet, 1 on mobile**. With few results the cards keep their normal width and the rest of the row stays empty, they do not stretch.
- Card (Figma component `Smartphone card`): image wrapper, then an info row with brand above name on the left and price on the right. The whole card is a link to the detail.
- Counter equals the number of cards shown.
- **Counter typography (confirmed):** Helvetica Neue Light 300, 12px, line height 100%, uppercase. Uses the shell font stack `Helvetica, Arial, sans-serif`.
- **Card border (confirmed):** 1px `#000000` (`--color-border-card`). **Search underline (confirmed):** 1px `#000000` (`--color-border-search-underline`).
- **Vertical spacing (proposed):** page padding stays as the shell breakpoints (16/40/100px). The search block and the counter each have a 24px bottom margin before the next block. **[CONFIRM]**
- Vertical spacing (≈, measured from screenshots, **[CONFIRM]**): on desktop and tablet the search sits about 60px below the header, the counter about 24px below the search and the grid about 70px below the counter. On mobile, about 40px, 24px and 40px.

## Card hover

On hover the card background goes **white to black**. A layer slides in **from bottom to top** and fills the card, its own background animating **white to black** as it rises. Text (brand, name, price) turns white. The image stays as is. The card component has a `Fill` layer, which is that layer.

Implementation guidance:

- A `::before` pseudo-element, absolutely positioned, `transform: translateY(100%)` to `translateY(0)` with `background` `#FFFFFF` to `#000000`, both transitioning. **Decided: `ease-in-out`, 1 second in total.** The fill rising/darkening and the text going from black to white use the same duration and easing, so they finish together. Define them as `--duration-hover: 1000ms` and `--easing-hover: ease-in-out`. On mouse leave the layer slides back down with the same timing. Content sits above the layer.
- Trigger on `:hover` **and** `:focus-visible`.
- Wrap the hover effect in `@media (hover: hover)` to avoid sticky hover on touch devices.
- Under `prefers-reduced-motion: reduce`, drop the slide and switch colors instantly.

The same card (and hover) is reused in "Similar items".

## Product detail

- Below the header, a `< BACK` link: 12px, uppercase, glyph `aria-hidden` and accessible name `BACK`. Visible in every state (loading, not found, error, success).
- Desktop and tablet: large image on the left, info column on the right. Mobile: image on top, info below, full width.
- Info column, in order: name, price, storage selector, color selector, add button.
- **Storage selector (confirmed):** segmented buttons, unselected `1px #CCCCCC`, selected `1px #000000`, equal width on mobile, option label 14px. Exactly one selectable, nothing pre-selected. The radio's accessible name is `{capacity}, {price}` (for example `128 GB, 959,42 EUR`), and its value is the raw capacity string.
- **Color selector (confirmed):** square **24 × 24px** swatches from `hexCode`, `1px #CCCCCC` border; the selected swatch gets a `1px #000000` outline. After selecting, the **color name is shown under the swatches** (12px, capitalized). Exactly one selectable, nothing pre-selected. An invalid `hexCode` falls back to the neutral `#CCCCCC`.
- **Add button:** full width of the info column, 56px high. Disabled: `#F3F2F2` background, `#C2BFBC` label. Enabled (both options chosen, confirmed): `#000000` background with white label.
- **Specifications:** two-column table, uppercase labels on the left and values on the right, one horizontal rule per row. Order: BRAND, NAME, DESCRIPTION, SCREEN, RESOLUTION, PROCESSOR, MAIN CAMERA, SELFIE CAMERA, BATTERY, OS, SCREEN REFRESH RATE. Use a real `<table>` with row headers. `rating` is not shown anywhere.
- **Similar items:** section title, then a row of the same 344px cards, scrolling **horizontally**. The row starts aligned with the content container and **bleeds off the right edge** of the viewport. Under it, a thin scrollbar line spans the container width with a dark thumb. Style the native scrollbar (`scrollbar-color`, `scrollbar-width`) rather than building a custom one. The scroll area must be keyboard reachable (cards are focusable links).
- The detail frame contains a **`Loading bar`** layer; its appearance is still **[CONFIRM]**. The implemented loading state uses the text `LOADING...` (12px, uppercase) in a `role="status"`, consistent with the catalog.
- **Desktop vertical rhythm (confirmed, human-provided):** content starts ≈240px below the header; back link → title 14px; title → price 12px; price → storage label 65px; storage label → options 30px; options → color label 45px; color label → swatches 25px; swatches → add button 65px; product → `SPECIFICATIONS` title 240px; title → table 45px. The mobile and tablet rhythm stays fluid **[CONFIRM]**.

## Cart

- Title `CART ({n})`.
- Each line (Figma component `Cart item`): product image on the left, then name (uppercase), `{storage} | {color name}` (uppercase), price, and `Eliminar` aligned to the bottom of the image.
- Footer: outlined `CONTINUE SHOPPING` on the left, `TOTAL {price} EUR` and the dark `PAY` button on the right (desktop and tablet). On mobile the total is on its own row and both buttons sit side by side below it.
- Empty cart: only the title with `(0)` and `CONTINUE SHOPPING` (full width on mobile). No total, no `PAY`.
- Header: same as every other view. The desktop cart frame also draws a thin full-width line under the header, which the list and detail frames do not. Replicate it only on the cart, or drop it for consistency **[CONFIRM]**.

## Accessibility checks against the Figma values

Contrast ratios against white, calculated from the Dev Mode colors:

| Color | Ratio | Verdict |
|---|---|---|
| `#DF0000` (`Eliminar`) | ≈ 5.1:1 | Passes AA |
| `#79736D` (brand label, 10px) | ≈ 4.7:1 | Passes AA |
| `#AAAAAA` (search placeholder) | ≈ 2.3:1 | **Below AA (4.5:1)** |
| `#C2BFBC` on `#F3F2F2` (disabled button) | low | Disabled controls are exempt |

The placeholder is the one conflict between fidelity and the graded accessibility requirement. Proposed: darken the placeholder to about `#767676` (≈4.5:1), a small visual deviation. **Needs a human decision.** Either way the search input must have a real `<label>` (visually hidden), not just a placeholder.

Text is very small (10 to 12px). Do not go below the Figma sizes, and do not set font sizes in a way that blocks user zoom.

## Decisions resolved

| Question | Answer |
|---|---|
| Initial image in detail before choosing a color | The **first `colorOptions[].imageUrl`**. The list image is not used |
| Price before choosing storage | `From {basePrice} EUR` |
| Price after choosing storage | The full price of that storage option, no "From". The Figma shows 1099 EUR for 256 GB and 1199 EUR for 512 GB, so the UI always shows an absolute total |
| Header on the cart page | Same header as every view, icon included (human decision) |
| Quantity control in the cart | None. See "Cart without quantities" below |
| Cart without quantities | Confirmed (`add-cart-state`): every add creates its own line with a generated unique `lineId`, `Eliminar` removes exactly that line, and the header count is the number of lines. The cart persists in `localStorage` under `mbst:cart:v1`; totals are computed in integer cents (`Math.round(price * 100)` per line) |

Verified against the real API: `storageOptions[].price` is the absolute price of that option. `basePrice` equals one of those prices but is not always the cheapest (5 of 23 products), see `docs/api-notes.md`.

## Proposed (needs human confirmation)

- **`PAY`:** render it as in the Figma as a non-functional placeholder (`type="button"`, documented in the README as out of scope). Alternative: omit it.
- **`< BACK`:** a link to `/`. It does not rely on browser history, so it also works after a direct load.

## Inconsistencies in the Figma (do not copy)

- Desktop "Results" shows `20 RESULTS` over 2 cards. Mobile shows `2 RESULTS`. The counter is always the real number.
- Tablet cart shows `CART (9)` with a single line and a header badge of 1. Use the real count.
- Detail storage options read `256 GB / 512 GB / 1 GB`. These are mock values. Real ones come from the API.
- The list mock repeats the same phones. The real API may return duplicates or fewer than 20 distinct phones. Check in `add-bff-products-api` and handle it so React keys stay unique.

## Not designed (needs a proposal that matches the style)

Request error with retry, no-results state, product not found (404), and a failed image. Keep them minimal, text-only, uppercase, in the same monochrome style, and announce them to assistive tech. The loading state should follow the `Loading bar` once captured.

## Still to extract from Figma

- Confirm the tablet and mobile paddings (≈ values above), their card sizes, and the proposed breakpoints.
- Dev Mode values for: cart title and footer text, card and table border color.
- The `Loading bar` appearance.
- The back chevron and the clear (×) are text glyphs in the Figma, not icons. Read the exact character in each text layer's Content field (for example `‹` or `<`, `×` or `x`). The `Search` component also contains an icon layer, check what it is. Export is in the Properties panel (Export section), Dev Mode is not needed.