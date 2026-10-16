export const strings = {
  appName: 'MBST',
  homeLinkAria: 'MBST, home',
  cartLinkAriaZero: 'Cart, 0 items',
  cartLinkAriaOne: 'Cart, 1 item',
  cartLinkAriaPlural: (n: number) => `Cart, ${n} items`,
  cartTitle: (n: number) => `CART (${n})`,
  catalogTitle: 'Smartphones',
  catalogHeadingVisuallyHidden: 'Smartphones',
  detailTitleGeneric: 'Product',
  detailTitleNotFound: 'Product not found',
  detailLoading: 'LOADING...',
  detailErrorMessage: 'COULD NOT LOAD PRODUCT',
  detailRetry: 'RETRY',
  detailNotFoundHeading: 'PRODUCT NOT FOUND',
  detailBackLink: 'BACK',
  detailStorageLegend: 'STORAGE ¿HOW MUCH SPACE DO YOU NEED?',
  detailColorLegend: 'COLOR. PICK YOUR FAVOURITE.',
  detailAddButton: 'AÑADIR',
  detailAddHint: 'Select a storage and a color to add this phone to the cart.',
  detailAddedToCart: (name: string) => `${name} added to cart.`,
  detailSpecsHeading: 'SPECIFICATIONS',
  detailSimilarHeading: 'SIMILAR ITEMS',
  detailMissingValue: '-',
  cartViewTitle: 'Cart',
  notFoundTitle: 'Page not found',
  notFoundMessage: 'Page not found',
  backToHome: 'Go to home',
  skipToContent: 'Skip to content',
} as const;

export const detailSpecRows: ReadonlyArray<{
  label: string;
  key:
    | 'brand'
    | 'name'
    | 'description'
    | 'screen'
    | 'resolution'
    | 'processor'
    | 'mainCamera'
    | 'selfieCamera'
    | 'battery'
    | 'os'
    | 'screenRefreshRate';
}> = [
  { label: 'BRAND', key: 'brand' },
  { label: 'NAME', key: 'name' },
  { label: 'DESCRIPTION', key: 'description' },
  { label: 'SCREEN', key: 'screen' },
  { label: 'RESOLUTION', key: 'resolution' },
  { label: 'PROCESSOR', key: 'processor' },
  { label: 'MAIN CAMERA', key: 'mainCamera' },
  { label: 'SELFIE CAMERA', key: 'selfieCamera' },
  { label: 'BATTERY', key: 'battery' },
  { label: 'OS', key: 'os' },
  { label: 'SCREEN REFRESH RATE', key: 'screenRefreshRate' },
];
