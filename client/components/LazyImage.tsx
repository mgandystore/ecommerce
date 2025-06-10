import React, { useEffect, useState } from "react";

const loadedImages = new Map<string, boolean>();

interface LazyImageProps {
  src: string;
  blurSrc?: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  blurSrc,
  alt,
  className,
}) => {
  const [loaded, setLoaded] = useState(() => loadedImages.get(src) ?? false);

  useEffect(() => {
    if (loadedImages.get(src)) {
      setLoaded(true);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImages.set(src, true);
      setLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={loaded ? src : (blurSrc ?? src)}
      alt={alt}
      loading="lazy"
      className={className ? `object-cover ${className}` : "object-cover"}
    />
  );
};

export default LazyImage;
