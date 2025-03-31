import React from "react";
import StarRating from "@/components/StarRating";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Review } from "@/pages/types";

type ReviewSectionProps = {
	reviews: Review[]
	averageRating: number
}

const ReviewsSection = ({ reviews, averageRating }: ReviewSectionProps) => {
	const reviewCount = reviews.length;

	// Generate star distribution data
	const starDistribution = [5, 4, 3, 2, 1].map(star => {
		const starReviews = reviews.filter(r => Math.floor(+r.stars) === star);
		const count = starReviews.length;
		const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

		return { star, count, percentage };
	});

	return (
		<div id="reviews" className="py-12 px-6 max-sm:py-8">
			<div className="max-w-screen-lg mx-auto">
				<h2 className="text-emerald-700 text-2xl font-bold mb-8">Avis clients</h2>

			<div className="flex flex-col md:flex-row gap-8 mb-8">
				<div className="md:w-1/3 h-fit bg-white p-6 rounded-lg border border-gray-200">
					<div className="flex items-center mb-4">
						<div className="text-4xl font-bold text-stone-950 mr-2">{averageRating.toFixed(1)}</div>
						<div className="flex flex-col">
							<StarRating rating={averageRating} size="lg" />
							<div className="text-gray-500 text-sm">Basé sur {reviewCount} avis</div>
						</div>
					</div>

					<div className="space-y-2">
						{starDistribution.map(({ star, percentage }) => (
							<div key={star} className="flex items-center">
                <span className="w-8 text-sm text-gray-600 flex justify-center">
                  {star}<span className="ml-0.5">★</span>
                </span>
								<div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
									<div
										className="bg-amber-400 h-2.5 rounded-full"
										style={{ width: `${percentage}%` }}
									/>
								</div>
								<span className="w-10 text-xs text-gray-600 text-right">{percentage}%</span>
							</div>
						))}
					</div>
				</div>

				<div className="md:w-2/3">
					{reviews.slice(0, 3).map((review) => (
						<div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
							<div className="flex justify-between mb-2">
								<p className="font-bold text-stone-950">{review.name}</p>
								<p className="text-gray-500 text-sm">
									{format(new Date(review.created_at), "dd MMM yyyy", { locale: fr })}
								</p>
							</div>
							<div className="flex mb-2">
								<StarRating rating={+review.stars} size="sm" />
							</div>
							<span
								className="text-gray-600 text-sm"
								dangerouslySetInnerHTML={{ __html: review.content }}
							/>
						</div>
					))}
				</div>
				</div>
			</div>
		</div>
	);
};

export default ReviewsSection;
