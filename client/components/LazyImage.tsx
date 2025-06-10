import React, { useState, useEffect, useCallback } from 'react';

const loadedImages = new Map<string, boolean>();

interface LazyImageProps {
  src: string;
  blurSrc?: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, blurSrc, alt, className }) => {
  const [loaded, setLoaded] = useState(() => loadedImages.get(src) ?? false);

  const loadFullImage = useCallback(() => {
    if (loadedImages.get(src)) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImages.set(src, true);
      setLoaded(true);
    };
  }, [src]);

  useEffect(() => {
    if (!blurSrc && !loadedImages.get(src)) {
      loadFullImage();
    } else if (loadedImages.get(src)) {
      setLoaded(true);
    }
  }, [src, blurSrc, loadFullImage]);

  const handleBlurLoad = () => {
    if (!loadedImages.get(src)) {
      loadFullImage();
    }
  };

  return (
    <img
      src={loaded ? src : blurSrc ?? src}
      alt={alt}
      loading="lazy"
      className={className}
      onLoad={!loaded && blurSrc ? handleBlurLoad : undefined}
    />
  );
};

export default LazyImage;
