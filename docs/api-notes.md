# API notes

Contract of the upstream phones API, as documented in the challenge's Swagger. Read this before touching any data code.

> **Status legend:** items marked **[VERIFY]** come from the Swagger only and have not been confirmed against real responses. Confirm them with real calls during the `add-bff-products-api` change and update this file. Do not guess.

## Base

- Base URL: `https://prueba-tecnica-api-tienda-moviles.onrender.com`
- Auth: header `x-api-key` on **every** request. Without it the API answers `401 {"error":"UNAUTHORIZED","message":"Invalid API key"}`.
- The key is provided in the challenge statement. It lives only in the BFF environment (`UPSTREAM_API_KEY`), never in client code, logs, specs or git. Base URL goes in `UPSTREAM_API_URL`.
- CORS is open (`access-control-allow-origin: *`), so the browser *could* call the API directly. The BFF exists to keep the key out of the client and to give the web app a stable, normalized contract. State this trade-off in the README.
- Hosted on Render. One measurement of `GET /products?limit=20` took about 85 ms, probably warm. **[VERIFY]** Cold start (first request after idle time) has not been observed. The BFF needs a configurable timeout and the web app a proper loading state.
- Responses carry an `ETag`, so BFF-side caching is possible. Only add it if a change calls for it.

## Endpoints

### `GET /products`

| Query param | Type | Notes |
|---|---|---|
| `search` | string | Filters by brand or name. Verified: case-insensitive and partial (`samsung`, `Samsung`, `sam` and `galaxy` all return the same 6 products). Matching on both brand and name is inferred from that, not tested in isolation |
| `limit` | integer | Max items. Verified: omitting it returns all 24 products, so there is no small default |
| `offset` | integer | Pagination offset. Not needed by the challenge |

- `200`: array of `ProductSummary` (verified, even though the Swagger example shows a single object).
- `401`: invalid or missing key.
- There is **no total count** in the response. The result counter can only be the length of the returned array.

### `GET /products/{id}`

- `200`: `ProductDetail`.
- `401`: invalid or missing key.
- `404`: `{ "error": string, "message": string }`, product not found.
- `id` is a **string**.

## Types

```ts
export interface ProductSummary {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  imageUrl: string;
}

export interface ColorOption {
  name: string;
  hexCode: string;
  imageUrl: string; // image shown when this color is selected
}

export interface StorageOption {
  capacity: string; // "128 GB", "128GB" or "1 TB": spacing is inconsistent
  price: number;
}

export interface ProductSpecs {
  screen: string;
  resolution: string;
  processor: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  screenRefreshRate: string;
}

export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  description: string;
  basePrice: number;
  rating: number;
  specs: ProductSpecs;
  colorOptions: ColorOption[];
  storageOptions: StorageOption[];
  similarProducts: ProductSummary[];
}

export interface ApiError {
  error: string;
  message: string;
}
```

Which fields can actually be missing or empty is unknown **[VERIFY]**. Until checked, the web app must not crash on an empty `colorOptions`, `storageOptions` or `similarProducts`, or on a missing spec.

## Verified against the real API (2026-10-15)

Checked with the list endpoint and 23 detail requests (one per unique id). No request failed.

- `/products` returns 24 products with 23 unique ids. The duplicated id is `XMI-RN13P5G` (Redmi Note 13 Pro 5G), at positions 5 and 6. Both records are **identical** (brand, name, basePrice, imageUrl), so keeping the first occurrence loses nothing. Both fall inside the first 20.
- `storageOptions[].price` is the **absolute** price of that capacity, not an increment (for example iPhone 15 Pro Max: 256 GB 1319, 512 GB 1449, 1 TB 1699).
- `basePrice` always equals the price of one storage option, but **not always the cheapest one**. It is the cheapest in most products, but not in 5: `SMG-A25` (239, cheapest 219), `SMG-S23FE` (699, 649), `SMG-S24U` (1329, 1229), `XMI-14` (899, 849) and `XMI-R13C` (149, 139).
- `capacity` strings are inconsistent: `"128 GB"` and `"128GB"` both appear, and there is `"1 TB"`.
- Many products have a single choice. 11 of 23 have one storage option, and 5 have one storage option **and** one color (`OPP-A18`, `RLM-NOTE50`, `SNY-XPERIA1V`, `XIA-R12`, `XMI-13TPro`). Colors range from 1 to 6 and storage from 1 to 3. None of the 23 had empty `colorOptions` or `storageOptions`.
- Some prices have decimals (`959.42`, `117.29`, `553.31`).
- `similarProducts` has exactly 6 entries for every product.
- Ids are mixed case with hyphens (`APL-I15PM`, `XMI-13TPro`).
- Image URLs use `http://`, not `https://`, on the same host as the API.
- Names have inconsistent casing (`edge 50 Pro`, `g24`, `14`). The design uppercases names in cards and titles, so only the specs table shows them as they are.
- Figma mock prices (for example Galaxy S24 Ultra 1099) do not match the real data (1329). The Figma is not a price reference.

## Still to check (first tasks of the BFF change)

1. Whether every image URL (list, colors, similar) answers 200 over `https://`, and whether images need the API key.
2. Whether `similarProducts` contains the product itself or repeated ids.
3. `search` on one field only: a brand-only and a name-only term (for example `apple` and `iphone`), and `limit` + `search` together.
4. Cold start after an idle period.

## Decisions pending (need to be settled in the specs)

- **Result counter and the 20-item limit.** With 23 unique products, always requesting `limit=20` shows 20 results without a search, and searches return fewer (for example 6 for `samsung`). Proposed: keep it. Confirm.
- **Meaning of "From {price}" in the detail.** Proposed: `basePrice`, so the price matches the card the user just clicked. Alternative: the cheapest storage price, which is more truthful for the 5 products where the two differ but would not match the card.
- **Products with a single option.** 5 products have nothing to choose. Proposed: do **not** auto-select, so the add button follows the Figma and the statement literally (it enables only after the user selects). Alternative: auto-select when there is exactly one option. Document the choice in the README either way.
- **Price format.** Decimals exist (`959.42`). Proposed: show decimals only when present, with a comma as separator (`959,42 EUR`, `1099 EUR`), and compute cart totals in integer cents to avoid floating point errors.

Resolved (details in `docs/design-notes.md`):

- Initial image in the detail view is the first `colorOptions[].imageUrl`.
- Price shows `From {price}` until a storage option is chosen, then that option's full price. Prices are absolute (verified).
- The cart has no quantity control. Cart line behavior is proposed in `docs/design-notes.md` and still needs confirmation.
- The duplicated id is an identical record, so deduplicating in the BFF is safe.

## BFF contract (proposed)

The web app talks only to these routes. The BFF forwards to the upstream API adding `x-api-key`.

| BFF route | Upstream | Notes |
|---|---|---|
| `GET /api/products?search=&limit=&offset=` | `GET /products` | Validate and clamp params. Forward only known ones |
| `GET /api/products/:id` | `GET /products/{id}` | Reject empty or malformed ids |

Error mapping (the client never sees upstream auth failures as its own):

| Situation | BFF responds |
|---|---|
| Upstream `404` | `404` with `ApiError` |
| Upstream `401` (our key is wrong) | `502`, logged server-side without the key |
| Upstream timeout or network failure | `504` / `502` with `ApiError` |
| Invalid params from the client | `400` with `ApiError` |

All BFF error bodies use the `ApiError` shape so the web client handles a single format.

### Normalization in the BFF (proposed)

- Deduplicate products by `id`, keeping the first occurrence, **before** applying `offset` and `limit`. Only `search` is forwarded upstream.
- Rewrite image URLs from `http://` to `https://` when they point at the upstream host, after confirming that `https://` serves them. Mixed content can produce warnings or blocked images once the app is served over HTTPS.
- Validate `:id` against `^[A-Za-z0-9_-]{1,64}$`.
- Leave `capacity` strings and names untouched. Display formatting (`128GB` to `128 GB`) belongs to the web app, and identity must use the raw value.