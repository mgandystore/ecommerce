import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Thumbs, Zoom } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

// Basic image type used by the gallery
export type Image = {
  url: string;
  url_thumb: string;
  url_large: string;
  alt?: string;
};

export interface ProductGalleryProps {
  images: { product_images: Image[] };
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [thumbs, setThumbs] = useState<SwiperType | null>(null);
  const galleryImages = images.product_images || [];

  if (galleryImages.length === 0) return null;

  return (
    <div className="flex gap-4">
      <Swiper
        onSwiper={setThumbs}
        direction="vertical"
        spaceBetween={8}
        slidesPerView={4}
        loop
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Thumbs]}
        className="hidden lg:block w-20 h-96"
      >
        {galleryImages.map((image, index) => (
          <SwiperSlide key={index} className="cursor-pointer">
            <img
              src={image.url_thumb}
              alt={image.alt || `Thumb ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        loop
        zoom
        thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
        modules={[Thumbs, Zoom]}
        className="flex-1 aspect-square"
      >
        {galleryImages.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="swiper-zoom-container w-full h-full">
              <img
                src={image.url_large}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductGallery;
