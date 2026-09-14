import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export const useInView = <T extends HTMLElement>(): { ref: RefObject<T | null>; visible: boolean } => {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
};

export const Reveal = ({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element => {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`tv-reveal${visible ? ' is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
};
