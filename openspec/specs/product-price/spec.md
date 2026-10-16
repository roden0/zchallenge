# product-price Specification

## Purpose
Defines the price shown in the detail view: a starting price before a storage option is chosen, the chosen storage option's price afterwards, and that color never affects it. Every price uses the shared formatter.

## Requirements

### Requirement: Price before choosing storage
Before a storage option is selected the price MUST be shown as `From {basePrice} EUR`, where `{basePrice}` is the product's `basePrice` formatted with the shared price formatter.

#### Scenario: Initial price
- **GIVEN** a product with `basePrice` `959.42`
- **WHEN** the view loads with no storage selected
- **THEN** the price shows `From 959,42 EUR`

### Requirement: Price after choosing storage
After a storage option is selected the price MUST be that option's price, formatted with the shared price formatter and without the `From` prefix. Selecting a different option MUST update the price.

#### Scenario: Selected option price
- **GIVEN** a storage option with capacity `256 GB` priced `959.42`
- **WHEN** that option is selected
- **THEN** the price shows `959,42 EUR` and does not contain `From`

#### Scenario: Changing the option
- **WHEN** another storage option is selected
- **THEN** the displayed price changes to that option's price

#### Scenario: Identical prices
- **GIVEN** two storage options with the same price
- **WHEN** either of them is selected
- **THEN** the price shows that value and the view keeps working

### Requirement: Price independent of color
Choosing or changing a color MUST NOT change the displayed price.

#### Scenario: Color does not change the price
- **GIVEN** a storage option is selected
- **WHEN** a color is selected or changed
- **THEN** the displayed price stays the same

### Requirement: Shared price formatting
Every price rendered by the view MUST go through the shared price formatter, so decimal values use a comma as separator and the `EUR` suffix.

#### Scenario: Decimal price
- **GIVEN** a storage option priced `117.29`
- **WHEN** it is selected
- **THEN** the price shows `117,29 EUR`
