import { useLayoutEffect, useRef, useState } from 'react';
import { useCart } from '../../shared/cart';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';
import styles from './CartPage.module.css';
import { CartFooter } from './components/CartFooter';
import { CartLine } from './components/CartLine';

export function CartPage() {
  usePageTitle(`${strings.cartViewTitle} | MBST`);
  const { lines, totalCents, removeLine } = useCart();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocusRef = useRef<string | 'heading' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useLayoutEffect(() => {
    const target = pendingFocusRef.current;
    if (target === null) {
      return;
    }
    pendingFocusRef.current = null;
    if (target === 'heading') {
      headingRef.current?.focus();
      return;
    }
    const targetLine = lines.find((line) => line.lineId === target);
    if (targetLine === undefined) {
      return;
    }
    removeRefs.current.get(target)?.focus();
  }, [lines]);

  function handleRemove(lineId: string) {
    const index = lines.findIndex((line) => line.lineId === lineId);
    const removed = lines[index];
    if (removed === undefined) {
      return;
    }
    const nextLine = lines[index + 1] ?? lines[index - 1];
    pendingFocusRef.current = nextLine ? nextLine.lineId : 'heading';
    setStatusMessage(strings.cartRemovedFromCart(removed.name));
    removeLine(lineId);
  }

  function registerRemoveRef(lineId: string) {
    return (node: HTMLButtonElement | null) => {
      if (node) {
        removeRefs.current.set(lineId, node);
      } else {
        removeRefs.current.delete(lineId);
      }
    };
  }

  return (
    <div className={styles.page}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        {strings.cartTitle(lines.length)}
      </h1>
      <span role="status" className="visually-hidden">
        {statusMessage}
      </span>
      {lines.length === 0 ? null : (
        // biome-ignore lint/a11y/noRedundantRoles: role="list" restores list semantics lost with list-style: none
        <ul role="list" className={styles.list}>
          {lines.map((line) => (
            <CartLine
              key={line.lineId}
              line={line}
              onRemove={handleRemove}
              registerRemoveRef={registerRemoveRef(line.lineId)}
            />
          ))}
        </ul>
      )}
      <CartFooter empty={lines.length === 0} totalCents={totalCents} />
    </div>
  );
}
