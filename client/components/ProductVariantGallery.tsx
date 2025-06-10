import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Thumbs, FreeMode, Zoom, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import "swiper/css/scrollbar";
import LazyImage from "./LazyImage";

type Image = {
  url: string;
  url_thumb: string;
  url_medium: string;
  url_large: string;
  url_blur: string;
  alt: string;
};

type Images = Record<string, Image[]>;

interface ProductVariantGalleryProps {
  images: Images;
  variant?: string;
}

const ProductVariantGallery: React.FC<ProductVariantGalleryProps> = ({
  images,
  variant = "product_images",
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryImages = useMemo(() => {
    const variantImages = variant && images[variant] ? images[variant] : [];
    const defaultImages = images.product_images || [];
    return [...variantImages, ...defaultImages];
  }, [images, variant]);

  if (!galleryImages.length) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const showNavigation = galleryImages.length > 1;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4">
      {showNavigation && (
        <div className="hidden lg:block relative flex-shrink-0 w-20">
          <Swiper
            onSwiper={setThumbsSwiper}
            direction="vertical"
            spaceBetween={8}
            slidesPerView={5}
            freeMode
            watchSlidesProgress
            modules={[FreeMode]}
            className="h-96 !w-full"
          >
            {galleryImages.map((image, index) => (
              <SwiperSlide
                key={`thumb-${index}`}
                className="cursor-pointer !w-full !h-auto"
              >
                <div
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    index === activeIndex
                      ? "border-black"
                      : "border-transparent"
                  }`}
                  onClick={() => mainSwiperRef.current?.slideToLoop(index)}
                >
                  <LazyImage
                    src={image.url_thumb || image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <div className="flex-grow w-full">
        <div className="relative w-full aspect-square overflow-hidden lg:rounded-md">
          {showNavigation && (
            <>
              <button
                onClick={() => mainSwiperRef.current?.slidePrev()}
                className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => mainSwiperRef.current?.slideNext()}
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <Swiper
            onSwiper={(swiper) => {
              mainSwiperRef.current = swiper;
            }}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Thumbs, Zoom, Scrollbar]}
            spaceBetween={10}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            loop
            zoom
            scrollbar={{ hide: false }}
            className="!w-full !h-full"
          >
            {galleryImages.map((image, index) => (
              <SwiperSlide
                key={`slide-${index}`}
                className="!w-full !h-full !overflow-hidden"
              >
                <div className="relative w-full h-full swiper-zoom-container">
                  <LazyImage
                    src={image.url_large || image.url}
                    blurSrc={image.url_blur}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover lg:rounded-md"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantGallery;
