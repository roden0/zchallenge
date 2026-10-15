import styles from './VisuallyHidden.module.css';

type VisuallyHiddenProps = {
  children: React.ReactNode;
  as?: 'span' | 'div';
};

export function VisuallyHidden({
  children,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return <Component className={styles.root}>{children}</Component>;
}
