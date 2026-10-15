import { Link } from 'react-router-dom';
import { usePageTitle } from '../shared/hooks/usePageTitle';
import { strings } from '../shared/strings';

export function NotFoundPage() {
  usePageTitle(`${strings.notFoundTitle} | MBST`);
  return (
    <div>
      <h1>{strings.notFoundTitle}</h1>
      <p>{strings.notFoundMessage}</p>
      <Link to="/">{strings.backToHome}</Link>
    </div>
  );
}
