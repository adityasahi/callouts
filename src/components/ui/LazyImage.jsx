import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lazy-loads an image when it enters the viewport.
 * Shows an animated skeleton placeholder while loading.
 */
export default function LazyImage({ src, alt = '', className, wrapperClassName }) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '150px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-muted', wrapperClassName)}>
      {/* Skeleton — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  );
}