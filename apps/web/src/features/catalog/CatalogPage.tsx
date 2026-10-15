import { VisuallyHidden } from '../../shared/components/VisuallyHidden/VisuallyHidden';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';

export function CatalogPage() {
  usePageTitle(`${strings.catalogTitle} | MBST`);
  return (
    <div>
      <h1>
        <VisuallyHidden>{strings.catalogHeadingVisuallyHidden}</VisuallyHidden>
      </h1>
      <p>Catalog</p>
    </div>
  );
}
