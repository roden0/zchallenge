# catalog-grid Specification

## Purpose
TBD - created by archiving change add-product-catalog. Update Purpose after archive.

## Requirements

### Requirement: Catalog grid layout and styling
The catalog grid displays product cards in a responsive layout with correct spacing and no layout issues.

#### Scenario: Grid layout
- GIVEN the results exist
- THEN products are rendered in a ul with role="list"
- AND one li per product
- AND grid columns: 1 column from 0px, 2 columns from 600px, 5 columns from 1024px (literal values in media queries)

#### Scenario: Borders and rows
- GIVEN adjacent cards
- THEN there is a 1px border using the card border token
- AND no double borders between neighbors
- AND with a partial last row, empty slots stay empty with no extra borders drawn
- AND with few results, cards keep normal width and do not stretch

#### Scenario: Spacing and fit
- GIVEN the grid
- THEN it fits the page padding of the shell
- AND vertical spacing between header, search, counter, and grid follows design notes (mark [CONFIRM] in design notes if uncertain)
- AND the grid never causes horizontal scroll at 393px, 834px, or 1920px
