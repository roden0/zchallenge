import { useParams } from 'react-router-dom';
import { ProductView } from './ProductView';

export function ProductDetailPage() {
  const { id } = useParams();
  return <ProductView key={id} id={id ?? ''} />;
}
