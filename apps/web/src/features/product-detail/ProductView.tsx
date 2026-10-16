import type { ColorOption, ProductDetail } from 'contracts';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';
import { formatPrice } from '../../shared/utils/format-price';
import { AddToCartButton } from './components/AddToCartButton';
import { ColorSelector } from './components/ColorSelector';
import { SimilarProducts } from './components/SimilarProducts';
import { SpecsTable } from './components/SpecsTable';
import { StorageSelector } from './components/StorageSelector';
import { useProduct } from './hooks/useProduct';
import styles from './ProductView.module.css';

function ProductContent({ product }: { product: ProductDetail }) {
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);

  const selectedStorage =
    product.storageOptions.find(
      (option) => option.capacity === selectedCapacity,
    ) ?? null;
  const displayPrice = selectedStorage
    ? formatPrice(selectedStorage.price)
    : `From ${formatPrice(product.basePrice)}`;
  const image = selectedColor?.imageUrl ?? product.colorOptions[0]?.imageUrl;
  const alt = selectedColor
    ? `${product.name}, ${selectedColor.name}`
    : product.name;
  const preloadedColors = product.colorOptions.filter(
    (option) => option.imageUrl !== image,
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.imageArea}>
          <div className={styles.imageWrapper}>
            {image && <img src={image} alt={alt} className={styles.image} />}
          </div>
          {preloadedColors.length > 0 && (
            <div className={styles.preloadImages} aria-hidden="true">
              {preloadedColors.map((option) => (
                <img key={option.name} src={option.imageUrl} alt="" />
              ))}
            </div>
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{displayPrice}</p>
          <StorageSelector
            options={product.storageOptions}
            selected={selectedCapacity}
            onSelect={setSelectedCapacity}
          />
          <ColorSelector
            options={product.colorOptions}
            selected={selectedColor}
            onSelect={setSelectedColor}
          />
          <AddToCartButton
            product={product}
            storage={selectedStorage}
            color={selectedColor}
          />
        </div>
      </div>
      <section className={styles.specsSection}>
        <h2 className={styles.specsTitle}>{strings.detailSpecsHeading}</h2>
        <SpecsTable product={product} />
      </section>
      <SimilarProducts products={product.similarProducts} />
    </>
  );
}

export function ProductView({ id }: { id: string }) {
  const { status, product, retry } = useProduct(id);

  const title =
    status === 'success' && product
      ? `${product.name} | MBST`
      : status === 'notFound'
        ? `${strings.detailTitleNotFound} | MBST`
        : `${strings.detailTitleGeneric} | MBST`;
  usePageTitle(title);

  return (
    <section className={styles.page}>
      <Link to="/" className={styles.backLink}>
        <span aria-hidden="true">&lt;</span> {strings.detailBackLink}
      </Link>
      {status === 'loading' && (
        <div className={styles.stateRegion}>
          <h1 className="visually-hidden">{strings.detailTitleGeneric}</h1>
          <div role="status" className={styles.stateText}>
            {strings.detailLoading}
          </div>
        </div>
      )}
      {status === 'notFound' && (
        <div className={styles.stateRegion}>
          <h1 className={styles.stateText}>{strings.detailNotFoundHeading}</h1>
        </div>
      )}
      {status === 'error' && (
        <div className={styles.stateRegion}>
          <h1 className="visually-hidden">{strings.detailTitleGeneric}</h1>
          <div role="alert" className={styles.stateText}>
            {strings.detailErrorMessage}
          </div>
          <button type="button" className={styles.retryButton} onClick={retry}>
            {strings.detailRetry}
          </button>
        </div>
      )}
      {status === 'success' && product && <ProductContent product={product} />}
    </section>
  );
}
