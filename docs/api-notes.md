# API notes

Contract of the upstream phones API, as documented in the challenge's Swagger. Read this before touching any data code.

> **Status legend:** items marked **[VERIFY]** come from the Swagger only and have not been confirmed against real responses. Confirm them with real calls during the `add-bff-products-api` change and update this file. Do not guess.

## Base

- Base URL: `https://prueba-tecnica-api-tienda-moviles.onrender.com`
- Auth: header `x-api-key` on **every** request. Without it the API answers `401 {"error":"UNAUTHORIZED","message":"Invalid API key"}`.
- The key is provided in the challenge statement. It lives only in the BFF environment (`UPSTREAM_API_KEY`), never in client code, logs, specs or git. Base URL goes in `UPSTREAM_API_URL`.
- CORS is open (`access-control-allow-origin: *`), so the browser *could* call the API directly. The BFF exists to keep the key out of the client and to give the web app a stable, normalized contract. State this trade-off in the README.
- Hosted on Render. **[VERIFY]** The first request after idle time may be slow (cold start). The BFF needs a timeout and the web app a proper loading state.
- Responses carry an `ETag`, so BFF-side caching is possible. Only add it if a change calls for it.

## Endpoints

### `GET /products`

| Query param | Type | Notes |
|---|---|---|
| `search` | string | Filters by brand or name. **[VERIFY]** case sensitivity, partial matches, whether brand and name are combined |
| `limit` | integer | Max items. **[VERIFY]** default when omitted |
| `offset` | integer | Pagination offset. Not needed by the challenge |

- `200`: array of `ProductSummary`. The Swagger example shows a single object, but the endpoint is a list. **[VERIFY]**
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
  capacity: string; // e.g. "128 GB", format [VERIFY]
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

## Things to check against real data

1. **Duplicate `id`s in `/products`.** They would cause React `key` warnings and break the clean-console requirement.
2. **Meaning of `storageOptions[].price`.** Is it the absolute price of that capacity, or an increment over `basePrice`? The price shown in the detail view and the cart depends on this.
3. **Format of `capacity` and color `name`.** They identify cart lines, so they must be stable strings.
4. **`search` behavior**, `limit` default, and what happens with `limit` + `search` together.
5. **Image URLs.** Do they all load? Are some broken or very large?
6. **Products with one color or one storage option**, or none.

## Decisions pending (need to be settled in the specs)

- **Result counter and the 20-item limit.** The challenge asks for the first 20 phones and a results counter. Proposed: always request `limit=20`, so the counter is capped at 20. Confirm this is acceptable, or the counter would need a second request.

Resolved by the Figma (details in `docs/design-notes.md`):

- Initial image in the detail view is the first `colorOptions[].imageUrl`.
- Price shows `From {basePrice}` until a storage option is chosen, then that option's full price.
- The cart has no quantity control. Cart line behavior is proposed in `docs/design-notes.md` and still needs confirmation.

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