import {Star, StarHalf} from "lucide-react";

interface StarRatingProps {
	rating?: number;
	size?: 'sm' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
																								 rating = 0,
																								 size = 'lg'
																							 }) => {
	const starSize = size === 'sm' ? 16 : 20;
	const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

	return (
		<div className="flex relative">
			{/* Background layer (empty stars) */}
			<div className="flex">
				{[...Array(5)].map((_, i) => (
					<Star
						key={`bg-${i}`}
						size={starSize}
						className={`${sizeClass} text-gray-300`}
						fill="currentColor"
						strokeWidth={0}
					/>
				))}
			</div>

			{/* Foreground layer (filled and half stars) */}
			<div className="flex absolute top-0 left-0">
				{[...Array(5)].map((_, i) => {
					// Determine star type
					if (i < Math.floor(rating)) {
						return (
							<Star
								key={`filled-${i}`}
								size={starSize}
								className={`${sizeClass} text-amber-400`}
								fill="currentColor"
								strokeWidth={0}
							/>
						);
					} else if (i === Math.floor(rating) && rating % 1 > 0) {
						return (
							<StarHalf
								key={`half-${i}`}
								size={starSize}
								className={`${sizeClass} text-amber-400`}
								fill="currentColor"
								strokeWidth={0}
							/>
						);
					}
					return <div key={`empty-space-${i}`} className={sizeClass} />;
				})}
			</div>
		</div>
	);
};

export default StarRating;
