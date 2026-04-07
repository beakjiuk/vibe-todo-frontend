import { useEffect } from 'react';

export function useBodyClass(className: string) {
  useEffect(() => {
    const prev = document.body.className;
    document.body.className = className;
    return () => {
      document.body.className = prev;
    };
  }, [className]);
}
