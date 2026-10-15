import type {
  ColorOption,
  ProductDetail,
  ProductSpecs,
  ProductSummary,
  StorageOption,
} from 'contracts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isProductSummary(value: unknown): value is ProductSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.brand) &&
    isString(value.name) &&
    isNumber(value.basePrice) &&
    isString(value.imageUrl)
  );
}

function isColorOption(value: unknown): value is ColorOption {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.name) && isString(value.hexCode) && isString(value.imageUrl)
  );
}

function isStorageOption(value: unknown): value is StorageOption {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.capacity) && isNumber(value.price);
}

function isProductSpecs(value: unknown): value is ProductSpecs {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.screen) &&
    isString(value.resolution) &&
    isString(value.processor) &&
    isString(value.mainCamera) &&
    isString(value.selfieCamera) &&
    isString(value.battery) &&
    isString(value.os) &&
    isString(value.screenRefreshRate)
  );
}

export function isProductSummaryArray(
  value: unknown,
): value is ProductSummary[] {
  return Array.isArray(value) && value.every(isProductSummary);
}

export function isProductDetail(value: unknown): value is ProductDetail {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !isString(value.id) ||
    !isString(value.brand) ||
    !isString(value.name) ||
    !isString(value.description) ||
    !isNumber(value.basePrice) ||
    !isNumber(value.rating) ||
    !isProductSpecs(value.specs)
  ) {
    return false;
  }

  return (
    Array.isArray(value.colorOptions) &&
    value.colorOptions.every(isColorOption) &&
    Array.isArray(value.storageOptions) &&
    value.storageOptions.every(isStorageOption) &&
    Array.isArray(value.similarProducts) &&
    value.similarProducts.every(isProductSummary)
  );
}
