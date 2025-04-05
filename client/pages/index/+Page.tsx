import React, {useState} from "react";
import {useData} from "vike-react/useData";
import {Data} from "@/pages/index/+data";
import StarRating from "@/components/StarRating";
import {Check, LoaderCircle, CheckCheck} from "lucide-react";
import {capitalize, cn} from "@/lib/utils";
import bleuCropped from "@/assets/variant_colors/bleu_cropped.webp";
import orangeCropped from "@/assets/variant_colors/orange_cropped.webp";
import roseCropped from "@/assets/variant_colors/rose_cropped.webp";
import vertCropped from "@/assets/variant_colors/vert_cropped.webp";
import violetCropped from "@/assets/variant_colors/violet_cropped.webp";
import ProductVariantGallery from "@/components/ProductVariantGallery";
import ReviewsSection from "@/pages/index/ReviewSection";
import FAQSection from "@/pages/index/FAQSection";
import {FooterReassurance, ProductReassurance} from "@/pages/index/Reassurance";
import {CheckoutResponse, ProductVariant, Specification} from "@/pages/types";

const variantColorToImage: Record<string, string> = {
	bleu: bleuCropped,
	orange: orangeCropped,
	rose: roseCropped,
	vert: vertCropped,
	violet: violetCropped,
};

export default function Page() {
	const home = useData<Data>();
	const countRating = home.reviews.length;
	const averageRating = +(
		home.reviews.reduce((acc, review) => acc + parseFloat(review.stars), 0) / countRating || 0
	).toFixed(1);

	const [currentProductVariant, setCurrentProductVariant] = useState(
		home.product_variants.find((variant) => variant.id === home.default_variant_id)
	);

	const currentPrice = ((currentProductVariant?.additional_price ?? 0) + home.product.base_price) / 100;

	const [loadingCheckoutButton, setLoadingCheckoutButton] = useState(false);
	const [loadingNotifyButton, setLoadingNotifyButton] = useState(false);
	const [notifyEmail, setNotifyEmail] = useState<string | null>(null);
	const [notified, setNotified] = useState<Record<string, boolean>>({});

	const isNotified = currentProductVariant?.id ? notified[currentProductVariant.id] : false;
	const isInStock = (currentProductVariant?.stock ?? 0) > 0;

	const goToCheckout = async () => {
		setLoadingCheckoutButton(true);
		try {
			const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL;
			const response = await fetch(`${apiUrl}/api/checkout/${currentProductVariant?.id}`);
			const checkoutResponse = await response.json();

			if (checkoutResponse.checkout_session_url) {
				window.location.href = checkoutResponse.checkout_session_url;
			} else {
				console.error("Invalid response:", checkoutResponse);
			}
		} catch (e) {
			throw e;
		} finally {
			setLoadingCheckoutButton(false);
		}
	};

	const notifyWhenInStock = async () => {
		if (isNotified) return;
		setLoadingNotifyButton(true);

		try {
			const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL;
			const url = new URL(`${apiUrl}/api/stock_notifications`);
			url.searchParams.append("email", notifyEmail ?? "");
			url.searchParams.append("product_variant_id", currentProductVariant?.id ?? "");

			const response = await fetch(url.toString(), {method: "POST"});

			if (response.status === 201) {
				setNotified({[currentProductVariant?.id ?? ""]: true, ...notified});
			} else {
				console.error("Error while notifying:", response.statusText);
			}
		} catch (e) {
			throw e;
		} finally {
			setLoadingNotifyButton(false);
		}
	};

	return (
		<main>
			{/* Product section */}
			<section className="bg-gray-50 py-24 px-6 max-lg:pb-8 max-lg:pt-0 max-lg:px-0">
				{/* Full-width gallery for mobile and tablet */}
				<div className="lg:hidden w-full">
					<ProductVariantGallery
						images={home.images}
						variant={currentProductVariant?.variants_slug ?? ''}
					/>
				</div>

				<Container className="max-lg:mt-8 max-lg:px-6">
					<div className="grid grid-cols-5 gap-12 max-lg:grid-cols-1 max-sm:gap-4">
						{/* Product gallery (hidden on mobile and tablet) */}
						<div className="col-span-3 max-lg:hidden">
							<ProductVariantGallery
								images={home.images}
								variant={currentProductVariant?.variants_slug ?? ''}
							/>
						</div>

						{/* Product info */}
						<article className="col-span-2 max-lg:col-span-1">
							<header className="mb-4">
								<h1 className="text-4xl max-sm:text-3xl font-bold text-emerald-700">
									{home.product.name}
								</h1>

								<div className="flex items-center gap-2 mt-3">
									<StarRating rating={averageRating} size="lg"/>
									<span className="text-sm text-gray-500">
                    {averageRating}/5 ({countRating} avis)
                  </span>
								</div>

								<div className="mt-3 text-3xl max-sm:text-xl font-bold text-stone-950">
									{currentPrice} €
								</div>
							</header>

							<div className="my-4">
								<span dangerouslySetInnerHTML={{__html: home.product.description}}/>
							</div>

							{/* Color variants */}
							<ColorVariantSelector
								variants={home.product_variants}
								currentVariant={currentProductVariant}
								onChange={setCurrentProductVariant}
							/>

							{/* Purchase or notify section */}
							{isInStock ? (
								<div className="my-6">
									<Button
										onClick={goToCheckout}
										loading={loadingCheckoutButton}
										className="py-5 bg-amber-400 hover:bg-amber-300 focus:bg-amber-500 text-lg max-lg:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 max-lg:hidden"
									>
										Acheter
									</Button>
								</div>
							) : (
								<div className="mb-6 mt-4">
									{!isNotified ? (
										<div className="flex flex-col gap-4">
											<label className="flex flex-col">
                        <span className="py-2 text-xl text-stone-950">
                          Soyez le premier informé du retour en stock
                        </span>
												<input
													type="email"
													disabled={isNotified}
													value={notifyEmail ?? ""}
													onChange={(e) => setNotifyEmail(e.target.value)}
													placeholder="Entrez votre adresse e-mail"
													className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500"
												/>
											</label>

											<Button
												onClick={notifyWhenInStock}
												loading={loadingNotifyButton}
												className="mt-2 bg-emerald-950 hover:bg-emerald-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
											>
												M'avertir du retour en stock
											</Button>
										</div>
									) : (
										<div className="flex items-center gap-2 p-2 bg-green-100 border border-green-200 rounded-lg">
											<CheckCheck className="w-6 h-6 text-emerald-500 flex-shrink-0"/>
											<span className="text-sm text-stone-950">
                        Vous êtes inscrit pour être averti du retour en stock sur cette couleur
                      </span>
										</div>
									)}
								</div>
							)}

							<ProductReassurance/>


							{/* Specifications */}
							<ProductSpecifications specifications={home.product.specifications}/>
						</article>
					</div>
				</Container>
			</section>

			{/* Reviews and FAQ section */}
			<section className="bg-white px-6 py-6">
				<Container>
					<h2 id="reviews-heading" className="sr-only">Avis et FAQ</h2>
					<div className="flex flex-col gap-8">
						<ReviewsSection reviews={home.reviews} averageRating={averageRating}/>
						<FAQSection faqs={home.product.faq.sort((a, b) => a.position - b.position)}/>
					</div>
				</Container>
			</section>

				<FooterReassurance/>

				<StickyBuyButton isInStock={isInStock}
												 onClick={goToCheckout}
												 loading={loadingCheckoutButton}
												 currentVariant={currentProductVariant}
												 price={currentPrice}/>


		</main>
	);
}


// Container component for consistent layout
interface ContainerProps {
	className?: string;
	children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({className, children}) => (
	<div className={cn("max-w-screen-2xl mx-auto", className)}>
		{children}
	</div>
);

// Button component for consistent styling
interface ButtonProps {
	onClick: () => void;
	loading?: boolean;
	className?: string;
	children: React.ReactNode;
	loadingText?: string;
	disabled?: boolean;
}

function Button({onClick, loading, className, children, loadingText = "Chargement...", disabled}: ButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={loading || disabled}
			className={cn(
				"cursor-pointer flex justify-center items-center gap-2.5",
				"w-full py-4 rounded-lg",
				"font-semibold transition duration-200 ease-in-out",
				loading || disabled ? "opacity-50 pointer-events-none" : "",
				className
			)}
		>
			{loading ? (
				<>
					<LoaderCircle className="w-4 h-4 animate-spin"/> {loadingText}
				</>
			) : (
				children
			)}
		</button>
	)
}

// Color variant selector component
interface ColorVariantSelectorProps {
	variants: ProductVariant[];
	currentVariant: ProductVariant | undefined;
	onChange: (variant: ProductVariant) => void;
}

function ColorVariantSelector({variants, currentVariant, onChange}: ColorVariantSelectorProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<h3 className="text-stone-950 text-base max-sm:text-sm font-bold">Couleur</h3>
				<span className="text-stone-950 text-base max-sm:text-sm">
        {capitalize(currentVariant?.variants.couleur || '')}
      </span>

				{(currentVariant?.stock || 0) > 0 && (
					<div className="flex items-center gap-2 pl-2">
						<div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"/>
						<span className="text-sm text-emerald-500">En stock</span>
					</div>
				)}
			</div>

			<div className="flex gap-4 pl-1">
				{variants.map((variant, idx) => {
					const selected = variant.id === currentVariant?.id;
					return (
						<button
							key={idx}
							onClick={() => onChange(variant)}
							className={cn(
								"flex justify-center items-center",
								"w-8 h-8 rounded-full",
								"bg-cover bg-center",
								"cursor-pointer transition-all duration-300",
								selected ? "ring-2 ring-offset-2 ring-blue-500/40 w-10" : ""
							)}
							style={{backgroundImage: `url(${variantColorToImage[variant.variants.couleur]})`}}
							aria-label={`Couleur ${variant.variants.couleur}`}
						>
							{selected && <Check className="w-4 h-4 text-white"/>}
						</button>
					);
				})}
			</div>
		</div>
	)
}

// Product specifications component
interface ProductSpecificationsProps {
	specifications: Specification[];
}

function ProductSpecifications({specifications}: ProductSpecificationsProps) {
	return (
		<div className="mt-6">
			<h3 className="mb-2 text-stone-950 font-semibold">Spécifications</h3>
			<table className="w-full">
				<tbody>
					{specifications.map((item, index) => (
						<tr
							key={index}
							className={index === 0 ? "" : "border-t border-gray-500 border-opacity-50"}
						>
							<td className="py-4 pr-6 max-sm:pr-4 align-top text-sm text-stone-950 font-base">
								{item.key}
							</td>
							<td
								className="py-4 align-top text-sm text-gray-500 font-base"
								dangerouslySetInnerHTML={{__html: item.value}}
							/>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


type StickyBuyButtonProps = {
	isInStock: boolean;
	onClick: () => void;
	loading?: boolean;
	price: number;
	currentVariant?: ProductVariant;
}

function StickyBuyButton({isInStock, onClick, loading, price, currentVariant}: StickyBuyButtonProps) {
	if (!isInStock || !currentVariant) return null;

	// Get the color image from the variant
	const colorImage = variantColorToImage[currentVariant.variants.couleur];
	const colorName = capitalize(currentVariant.variants.couleur || '');

	return (
		<div id="sticky-button-buy"
				 className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
			<div className="max-w-screen-2xl mx-auto py-6 px-4">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div
							className="w-6 h-6 rounded-full bg-cover bg-center"
							style={{backgroundImage: `url(${colorImage})`}}
							aria-label={`Couleur ${colorName}`}
						/>
						<div>
							<span className="text-sm text-stone-950 font-semibold">{colorName}</span>
						</div>
					</div>

					<Button
						onClick={onClick}
						loading={loading}
						className="w-full pb-4 pt-2 bg-amber-400 hover:bg-amber-300 focus:bg-amber-500 text-base font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
					>
						Acheter — {price} €
					</Button>
				</div>


			</div>
		</div>
	)
}
