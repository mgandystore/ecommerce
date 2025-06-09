import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
// Import Swiper and required modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, FreeMode, Zoom } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/zoom';

// Define types for image structure
type Image = {
	url: string;
	url_thumb: string;
	url_medium: string;
	url_large: string;
	url_blur: string;
	alt: string;
};

// Define images object type - keys are variant slugs, values are image arrays
type Images = Record<string, Image[]>;

interface ProductVariantGalleryProps {
	images: Images;
	variant?: string;
}

const ProductVariantGallery: React.FC<ProductVariantGalleryProps> = ({
																																			 images,
																																			 variant = 'product_images'
																																		 }) => {
	// State
	const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

	// Reference to Swiper instance
	const mainSwiperRef = useRef<SwiperType | null>(null);
	const fullscreenSwiperRef = useRef<SwiperType | null>(null);

	// Helper function to get gallery images
	const getGalleryImages = () => {
		// Check if images and variant exist
		if (!images) return [];

		const variantImages = variant && images[variant] ? images[variant] : [];
		const defaultImages = images.product_images || [];

		// Return concatenated array of images - always show variant images followed by base product images
		return [...variantImages, ...defaultImages];
	};

	const [galleryImages, setGalleryImages] = useState<Image[]>(getGalleryImages());

	// Check if device is mobile or tablet on mount and when window resizes
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 1024); // Using 1024px as the lg breakpoint
		};

		// Initial check
		checkIfMobile();

		// Add event listener for resize
		window.addEventListener('resize', checkIfMobile);

		// Cleanup
		return () => {
			window.removeEventListener('resize', checkIfMobile);
		};
	}, []);

	// Update gallery images when variant or images change
	useEffect(() => {
		const newGalleryImages = getGalleryImages();
		setGalleryImages(newGalleryImages);
		setActiveIndex(0);
		setLoadedImages(new Set());
		setIsLoading(true);

		// Reset the main swiper to the first slide
		if (mainSwiperRef.current) {
			mainSwiperRef.current.slideTo(0, 0); // Jump to first slide with no animation
		}
	}, [variant, images]);

	// Cleanup effect for Swiper instances
	useEffect(() => {
		return () => {
			// Cleanup on unmount
			if (mainSwiperRef.current && mainSwiperRef.current.destroy) {
				mainSwiperRef.current.destroy(true, true);
			}
			if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.destroy) {
				fullscreenSwiperRef.current.destroy(true, true);
			}
		};
	}, []);

	// Preload active image and adjacent images
	useEffect(() => {
		if (galleryImages.length === 0) return;

		// Preload current image
		const preloadImage = (index: number) => {
			if (!galleryImages[index]) return;

			const img = new Image();
			img.src = galleryImages[index].url_large;
			img.onload = () => {
				setLoadedImages(prev => {
					const newSet = new Set(prev);
					newSet.add(index);
					return newSet;
				});
				if (index === activeIndex) {
					setIsLoading(false);
				}
			};
		};

		// Preload active image
		preloadImage(activeIndex);

		// Preload adjacent images
		const prevIdx = activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1;
		const nextIdx = activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1;

		if (!loadedImages.has(prevIdx)) {
			preloadImage(prevIdx);
		}

		if (!loadedImages.has(nextIdx)) {
			preloadImage(nextIdx);
		}
	}, [activeIndex, galleryImages]);

	// Handle keyboard navigation in fullscreen mode
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isFullscreen) {
				if (e.key === 'ArrowLeft') {
					slidePrev();
				} else if (e.key === 'ArrowRight') {
					slideNext();
				} else if (e.key === 'Escape') {
					setIsFullscreen(false);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isFullscreen]);

	// Handle slide change
	const handleSlideChange = (swiper: SwiperType) => {
		if (swiper && typeof swiper.activeIndex === 'number') {
			const newIndex = swiper.activeIndex;
			setActiveIndex(newIndex);
			setIsLoading(!loadedImages.has(newIndex));
		}
	};

	// Effect to sync normal and fullscreen swipers
	useEffect(() => {
		// Sync active index between main swiper and fullscreen swiper
		if (isFullscreen && fullscreenSwiperRef.current) {
			fullscreenSwiperRef.current.slideTo(activeIndex, 0);
		} else if (!isFullscreen && mainSwiperRef.current) {
			mainSwiperRef.current.slideTo(activeIndex, 0);
		}
	}, [isFullscreen, activeIndex]);

	// Navigation functions
	const slidePrev = () => {
		if (isFullscreen && fullscreenSwiperRef.current) {
			fullscreenSwiperRef.current.slidePrev();
		} else if (mainSwiperRef.current) {
			mainSwiperRef.current.slidePrev();
		}
	};

	const slideNext = () => {
		if (isFullscreen && fullscreenSwiperRef.current) {
			fullscreenSwiperRef.current.slideNext();
		} else if (mainSwiperRef.current) {
			mainSwiperRef.current.slideNext();
		}
	};

	// Toggle fullscreen mode
	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	// If there are no images, display a placeholder
	if (!galleryImages || galleryImages.length === 0) {
		return (
			<div className="w-full h-64 bg-gray-100 flex items-center justify-center">
				<p className="text-gray-500">No images available</p>
			</div>
		);
	}

	// Check if we only have one image
	const showNavigation = galleryImages.length > 1;

	// Main gallery render
	const renderMainGallery = () => (
		<div className="w-full flex flex-col lg:flex-row gap-4">
			{/* Thumbnails - vertical on desktop (lg and above), hidden on smaller screens */}
			{showNavigation && (
				<div className="hidden lg:block relative flex-shrink-0 w-20">
					<Swiper
						onSwiper={setThumbsSwiper}
						direction="vertical"
						spaceBetween={8}
						slidesPerView={5}
						freeMode={true}
						loop={true}
                                                watchSlidesProgress={true}
                                                roundLengths={true}
                                                modules={[FreeMode]}
						className="h-96 !w-full"
					>
						{galleryImages.map((image, index) => (
							<SwiperSlide key={`thumb-${index}`} className="cursor-pointer !w-full !h-auto">
								<div
									className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
										index === activeIndex ? 'border-black' : 'border-transparent'
									}`}
									onClick={() => {
										if (mainSwiperRef.current) {
											mainSwiperRef.current.slideTo(index);
										}
									}}
								>
                                                                       <img
                                                                               src={image.url_thumb || image.url}
                                                                               alt={`Thumbnail ${index + 1}`}
                                                                               className="w-full h-full object-cover block"
                                                                       />
								</div>
							</SwiperSlide>
						))}
                                        </Swiper>

                                </div>
			)}

			{/* Main image container */}
			<div className="flex-grow w-full">
				<div className="relative w-full aspect-square bg-gray-100 overflow-hidden lg:rounded-md">
					{/* Navigation buttons - only show if more than one image */}
					{showNavigation && (
						<>
							<button
								onClick={slidePrev}
								className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors z-10"
								aria-label="Previous image"
							>
								<ChevronLeft className="w-6 h-6" />
							</button>

							<button
								onClick={slideNext}
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
                                                thumbs={{ swiper: showNavigation && !isMobile && thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                                modules={[Thumbs, Zoom]}
                                                zoom={{ maxRatio: 3 }}
                                                roundLengths={true}
                                                onSlideChange={handleSlideChange}
                                                initialSlide={activeIndex}
                                                className="!w-full !h-full"
                                        >
						{galleryImages.map((image, index) => (
                                                       <SwiperSlide key={`main-${index}`} className="!w-full !h-full !overflow-hidden bg-white">
                                                               <div className="swiper-zoom-container relative w-full h-full overflow-hidden">
                                                                        {/* Blur image shown only during loading */}
                                                                        {isLoading && activeIndex === index && image.url_blur && (
                                                                       <div className="absolute inset-0">
                                                                       <img
                                                                               src={image.url_blur}
                                                                               alt={image.alt || `Product image ${index + 1}`}
                                                                               className="w-full h-full object-cover lg:rounded-md block"
                                                                       />
                                                                       </div>
                                                                        )}

									{/* Large image */}
                                                                       <img
                                                                               src={image.url_large || image.url}
                                                                               alt={image.alt || `Product image ${index + 1}`}
                                                                               className={`swiper-zoom-target w-full h-full object-cover lg:rounded-md transition-opacity duration-300 block ${
                                                                               isLoading && activeIndex === index ? 'opacity-0' : 'opacity-100'
                                                                               }`}
                                                                       />
                                                                </div>
                                                        </SwiperSlide>
						))}
                                        </Swiper>

                                        {showNavigation && (
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                                                        {galleryImages.map((_, i) => (
                                                                <span
                                                                        key={`progress-${i}`}
                                                                        className={`block w-4 h-0.5 rounded-full ${i === activeIndex ? 'bg-black' : 'bg-black/30'}`}
                                                                />
                                                        ))}
                                                </div>
                                        )}

                                        {/* Fullscreen button */}
					<button
						onClick={toggleFullscreen}
						className="cursor-pointer absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors z-10"
						aria-label="View fullscreen"
					>
						<Maximize2 className="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	);

	// Fullscreen render
	const renderFullscreenView = () => (
		<div className="fixed inset-0 bg-black z-50 flex flex-col">
			<div className="flex justify-between p-4">
				<div className="text-white">
				</div>
				<button
					onClick={toggleFullscreen}
					className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
					aria-label="Close fullscreen"
				>
					<X className="w-6 h-6" />
				</button>
			</div>

			<div className="flex-grow flex items-center justify-center p-4 relative">
				{/* Custom fullscreen navigation buttons - only show if more than one image */}
				{showNavigation && (
					<>
						<button
							onClick={slidePrev}
							className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors z-10"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-8 h-8 text-white" />
						</button>

						<button
							onClick={slideNext}
							className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors z-10"
							aria-label="Next image"
						>
							<ChevronRight className="w-8 h-8 text-white" />
						</button>
					</>
				)}

				<div className="w-full h-full flex items-center justify-center">
					{/* Add a separate Swiper for fullscreen view */}
                                        <Swiper
                                                onSwiper={(swiper) => {
                                                        fullscreenSwiperRef.current = swiper;
                                                }}
                                                initialSlide={activeIndex}
                                                onSlideChange={handleSlideChange}
                                                modules={[Zoom]}
                                                zoom={{ maxRatio: 3 }}
                                                roundLengths={true}
                                                className="w-full h-full"
                                        >
						{galleryImages.map((image, index) => (
                                                       <SwiperSlide key={`fs-slide-${index}`} className="!w-full !h-full flex items-center justify-center bg-black">
                                                               <div className="swiper-zoom-container relative max-h-full max-w-full flex items-center justify-center overflow-hidden">
									{/* Blur image in fullscreen (shown only during loading) */}
									{isLoading && activeIndex === index && image.url_blur && (
										<div className="absolute inset-0 flex items-center justify-center">
                                                                               <img
                                                                               src={image.url_blur}
                                                                               alt={image.alt || `Product image ${index + 1}`}
                                                                               className="max-h-full max-w-full object-contain mx-auto block"
                                                                               style={{ filter: 'blur(8px)' }}
                                                                               />
										</div>
									)}

									{/* Large image in fullscreen */}
                                                                        <img
                                                                               src={image.url_large || image.url}
                                                                               alt={image.alt || `Product image ${index + 1}`}
                                                                               className={`swiper-zoom-target max-h-full max-w-full object-contain mx-auto transition-opacity duration-300 block ${
                                                                               isLoading && activeIndex === index ? 'opacity-0' : 'opacity-100'
                                                                               }`}
                                                                        />
								</div>
							</SwiperSlide>
						))}
                                        </Swiper>

                                        {showNavigation && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
                                                        {galleryImages.map((_, i) => (
                                                                <span
                                                                        key={`fs-progress-${i}`}
                                                                        className={`block w-6 h-0.5 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                />
                                                        ))}
                                                </div>
                                        )}
                                </div>

			</div>

			{/* Fullscreen thumbnails - only show if more than one image */}
			{showNavigation && (
				<div className="p-4 bg-black/50 overflow-x-auto">
					<div className="flex space-x-2 max-w-full">
						{galleryImages.map((image, index) => (
							<button
								key={`fs-thumb-${index}`}
								onClick={() => {
									if (fullscreenSwiperRef.current) {
										fullscreenSwiperRef.current.slideTo(index);
									}
								}}
								className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
									index === activeIndex ? 'border-white' : 'border-transparent'
								}`}
							>
                                                                <img
                                                                        src={image.url_thumb || image.url}
                                                                        alt={`Thumbnail ${index + 1}`}
                                                                        className="w-full h-full object-cover block"
                                                                />
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);

	return (
		<div className="w-full">
			{isFullscreen ? renderFullscreenView() : renderMainGallery()}
		</div>
	);
};

export default ProductVariantGallery;
