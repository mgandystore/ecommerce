import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

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
	// Get the appropriate images based on variant
	const getGalleryImages = () => {
		const variantImages = variant && images[variant] ? images[variant] : [];
		const defaultImages = images.product_images || [];
		return [...variantImages, ...defaultImages];
	};

	// State for active image index and fullscreen mode
	const [activeIndex, setActiveIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
	const [galleryImages, setGalleryImages] = useState<Image[]>(getGalleryImages());
	const [isMobile, setIsMobile] = useState(false);

	const mainImageRef = useRef<HTMLDivElement>(null);
	const thumbnailContainerRef = useRef<HTMLDivElement>(null);

	// Check if device is mobile on mount and when window resizes
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 1024);
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

	// Reset index when variant changes and images are different
	useEffect(() => {
		const newGalleryImages = getGalleryImages();
		// Only reset if the images actually changed
		if (JSON.stringify(newGalleryImages) !== JSON.stringify(galleryImages)) {
			setActiveIndex(0);
			setGalleryImages(newGalleryImages);
			setIsLoading(true);
			setLoadedImages(new Set());
		}
	}, [variant, images]);

	// Scroll to active thumbnail when active index changes
	useEffect(() => {
		scrollToThumbnail();
		// Set loading state when changing images
		setIsLoading(!loadedImages.has(activeIndex));
	}, [activeIndex]);

	// Handle large image load
	const handleImageLoad = () => {
		setIsLoading(false);
		setLoadedImages(prev => new Set([...prev, activeIndex]));
	};

	// Start preloading when component mounts
	useEffect(() => {
		// Preload the initial image
		if (galleryImages.length > 0) {
			const img = new Image();
			img.src = galleryImages[0].url_large;
			img.onload = () => {
				setLoadedImages(prev => new Set([...prev, 0]));
				setIsLoading(false);
			};
		}
	}, [galleryImages]);

	// Preload adjacent images
	useEffect(() => {
		const preloadAdjacentImages = () => {
			const prevIdx = getPrevIndex();
			const nextIdx = getNextIndex();

			if (galleryImages[prevIdx] && !loadedImages.has(prevIdx)) {
				const prevImg = new Image();
				prevImg.src = galleryImages[prevIdx].url_large;
				prevImg.onload = () => {
					setLoadedImages(prev => new Set([...prev, prevIdx]));
				};
			}

			if (galleryImages[nextIdx] && !loadedImages.has(nextIdx)) {
				const nextImg = new Image();
				nextImg.src = galleryImages[nextIdx].url_large;
				nextImg.onload = () => {
					setLoadedImages(prev => new Set([...prev, nextIdx]));
				};
			}
		};

		preloadAdjacentImages();
	}, [activeIndex, galleryImages, loadedImages]);

	// Get previous image index
	const getPrevIndex = () => {
		return activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1;
	};

	// Get next image index
	const getNextIndex = () => {
		return activeIndex === galleryImages.length - 1 ? 0 : activeIndex + 1;
	};

	// Navigate to previous image
	const prevImage = () => {
		setActiveIndex(getPrevIndex());
		setIsLoading(!loadedImages.has(getPrevIndex()));
	};

	// Navigate to next image
	const nextImage = () => {
		setActiveIndex(getNextIndex());
		setIsLoading(!loadedImages.has(getNextIndex()));
	};

	// Select image by index
	const selectImage = (index: number) => {
		setActiveIndex(index);
		setIsLoading(!loadedImages.has(index));
	};

	// Toggle fullscreen mode
	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	// Scroll thumbnail container to ensure active image is visible
	const scrollToThumbnail = () => {
		if (thumbnailContainerRef.current) {
			const container = thumbnailContainerRef.current;
			const thumbnailElements = container.querySelectorAll('.thumbnail');

			if (activeIndex < thumbnailElements.length) {
				const activeThumbnail = thumbnailElements[activeIndex] as HTMLElement;
				if (activeThumbnail) {
					container.scrollTop = activeThumbnail.offsetTop - container.clientHeight / 2 + activeThumbnail.clientHeight / 2;
				}
			}
		}
	};

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isFullscreen) {
				if (e.key === 'ArrowLeft') {
					prevImage();
				} else if (e.key === 'ArrowRight') {
					nextImage();
				} else if (e.key === 'Escape') {
					toggleFullscreen();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isFullscreen, activeIndex]);

	// If there are no images, display a placeholder
	if (!galleryImages.length) {
		return (
			<div className="w-full h-64 bg-gray-100 flex items-center justify-center">
				<p className="text-gray-500">No images available</p>
			</div>
		);
	}

	const currentImage = galleryImages[activeIndex];

	return (
		<div className="w-full">
			{/* Desktop View */}
			{!isMobile && (
				<div className="w-full flex flex-row gap-4">
					{/* Vertical Thumbnails */}
					<div className="relative flex-shrink-0 w-20">
						<div
							ref={thumbnailContainerRef}
							className="flex flex-col space-y-2 h-96 overflow-y-auto pt-4 pb-4 scrollbar-thin"
						>
							{galleryImages.map((image, index) => (
								<button
									key={`${image.url_thumb}-${index}`}
									onClick={() => selectImage(index)}
									className={`cursor-pointer thumbnail flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
										index === activeIndex ? 'border-black' : 'border-transparent'
									}`}
								>
									<img
										src={image.url_thumb}
										alt={`Thumbnail ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					</div>

					{/* Main image container */}
					<div className="flex-grow">
						<div
							ref={mainImageRef}
							className="relative w-full aspect-square bg-gray-100"
						>
							{/* Blur image shown only during initial loading */}
							{isLoading && (
								<div className="absolute inset-0">
									<img
										src={currentImage.url_blur}
										alt={currentImage.alt}
										className="w-full h-full object-cover rounded-md"
									/>
								</div>
							)}

							{/* Large image */}
							<img
								src={currentImage.url_large}
								alt={currentImage.alt}
								className={`w-full h-full object-cover rounded-md ${
									isLoading ? 'opacity-0' : 'opacity-100'
								}`}
								onLoad={handleImageLoad}
							/>

							{/* Image counter */}
							<div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
								{activeIndex + 1} / {galleryImages.length}
							</div>

							{/* Navigation arrows */}
							<button
								onClick={prevImage}
								className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
								aria-label="Previous image"
							>
								<ChevronLeft className="w-6 h-6" />
							</button>

							<button
								onClick={nextImage}
								className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
								aria-label="Next image"
							>
								<ChevronRight className="w-6 h-6" />
							</button>

							{/* Fullscreen button */}
							<button
								onClick={toggleFullscreen}
								className="cursor-pointer absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
								aria-label="View fullscreen"
							>
								<Maximize2 className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Mobile View */}
			{isMobile && (
				<div className="w-full">
					<div className="relative w-full aspect-square overflow-hidden bg-gray-100">
						{/* Blur image shown only during initial loading */}
						{isLoading && (
							<div className="absolute inset-0">
								<img
									src={currentImage.url_blur}
									alt={currentImage.alt}
									className="w-full h-full object-cover  object-cover rounded-md"
								/>
							</div>
						)}

						{/* Large image */}
						<img
							src={currentImage.url_large}
							alt={currentImage.alt}
							className={`
							w-full h-full object-cover rounded-md
							${isLoading ? 'opacity-0' : 'opacity-100'}`}
							onLoad={handleImageLoad}
						/>

						{/* Image counter */}
						<div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
							{activeIndex + 1} / {galleryImages.length}
						</div>

						{/* Navigation arrows for mobile view */}
						<button
							onClick={prevImage}
							className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>

						<button
							onClick={nextImage}
							className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
							aria-label="Next image"
						>
							<ChevronRight className="w-6 h-6" />
						</button>

						{/* Fullscreen button */}
						<button
							onClick={toggleFullscreen}
							className="cursor-pointer absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
							aria-label="View fullscreen"
						>
							<Maximize2 className="w-5 h-5" />
						</button>
					</div>

					{/* Mobile Indicators (dots) */}
					<div className="flex justify-center mt-4 space-x-2">
						{galleryImages.map((_, index) => (
							<button
								key={`indicator-${index}`}
								onClick={() => selectImage(index)}
								className={`h-2 w-2 rounded-full transition-colors ${
									index === activeIndex ? 'bg-black' : 'bg-gray-300'
								}`}
								aria-label={`View image ${index + 1}`}
							/>
						))}
					</div>
				</div>
			)}

			{/* Fullscreen Modal (same for both mobile and desktop) */}
			{isFullscreen && (
				<div className="fixed inset-0 bg-black z-50 flex flex-col">
					<div className="flex justify-between p-4">
						<div className="text-white">{currentImage.alt}</div>
						<button
							onClick={toggleFullscreen}
							className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
							aria-label="Close fullscreen"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					<div className="flex-grow flex items-center justify-center p-4 relative">
						{/* Blur image in fullscreen (shown only during loading) */}
						{isLoading && (
							<div className="absolute inset-0 flex items-center justify-center">
								<img
									src={currentImage.url_blur}
									alt={currentImage.alt}
									className="max-h-full max-w-full object-contain"
									style={{ filter: 'blur(8px)' }}
								/>
							</div>
						)}

						{/* Large image in fullscreen */}
						<img
							src={currentImage.url_large}
							alt={currentImage.alt}
							className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
								isLoading ? 'opacity-0' : 'opacity-100'
							}`}
							onLoad={handleImageLoad}
						/>

						{/* Image counter in fullscreen */}
						<div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded text-sm">
							{activeIndex + 1} / {galleryImages.length}
						</div>

						<button
							onClick={prevImage}
							className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
							aria-label="Previous image"
						>
							<ChevronLeft className="w-8 h-8 text-white" />
						</button>

						<button
							onClick={nextImage}
							className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
							aria-label="Next image"
						>
							<ChevronRight className="w-8 h-8 text-white" />
						</button>
					</div>

					{/* Fullscreen Indicators */}
					<div className="flex justify-center p-4 bg-black/50">
						<div className="flex space-x-2 overflow-x-auto max-w-full pb-2">
							{galleryImages.map((image, index) => (
								<button
									key={`fullscreen-${image.url_thumb}-${index}`}
									onClick={() => selectImage(index)}
									className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
										index === activeIndex ? 'border-white' : 'border-transparent'
									}`}
								>
									<img
										src={image.url_thumb}
										alt={`Thumbnail ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductVariantGallery;
