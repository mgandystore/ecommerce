import React, {useState, useRef, useEffect} from 'react';
import {Input} from "@/components/ui/input";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList
} from "@/components/ui/command";
import {ChronoshopAPI, CityZipCodeResult, ChronoLocation, OpeningHour} from "@/lib/chronoshop";
import {LoaderCircle, Clock, MapPin, Check} from 'lucide-react';
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ActionOrderState, OrderState} from "@/pages/order/reducer";

interface PickupPointShippingFormProps {
	state?: OrderState
	dispatcher: (action: (ActionOrderState)) => void
}

export default function PickupPointShippingForm({state, dispatcher}: PickupPointShippingFormProps) {
	const chronoshopClient = useRef<ChronoshopAPI>(new ChronoshopAPI());

	const [city, setCity] = useState<string>('');
	const [suggestions, setSuggestions] = useState<CityZipCodeResult[]>([]);
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [addressSelected, setAddressSelected] = useState<boolean>(false);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [pickupPoints, setPickupPoints] = useState<ChronoLocation[]>([]);
	const [isLoadingPickupPoints, setIsLoadingPickupPoints] = useState<boolean>(false);
	const [selectedPickupPoint, setSelectedPickupPoint] = useState<ChronoLocation | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (city.length < 3 || addressSelected) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			setIsLoading(true);
			try {
				const results = await chronoshopClient.current.searchCityZipCode(city.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
				setSuggestions(results);
				setShowSuggestions(true);
			} catch (error) {
				console.error("Error fetching suggestions:", error);
			} finally {
				setIsLoading(false);
			}
		};

		const timeoutId = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(timeoutId);
	}, [city, addressSelected]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, []);

	const handleAddressSelect = async (feature: CityZipCodeResult) => {
		try {
			setIsLoading(true);
			setCity(`${feature.city} (${feature.zipCode})`);
			setAddressSelected(true);
			setShowSuggestions(false);

			// Fetch pickup points
			setIsLoadingPickupPoints(true);
			const pickupPoints = await chronoshopClient.current.searchPickupPoints(feature.zipCode, feature.city);
			setPickupPoints(pickupPoints);
		} catch (error) {
			console.error("Error getting address details:", error);
		} finally {
			setIsLoading(false);
			setIsLoadingPickupPoints(false);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			setShowSuggestions(false);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			setSelectedIndex((prevIndex) =>
				prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
			);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			handleAddressSelect(suggestions[selectedIndex]);
		}
	};

	const handlePickupPointSelect = (point: ChronoLocation) => {
		dispatcher({
			type: 'update_shipping',
			data: {
				address_line1: point.address,
				city: point.city,
				postal_code: point.zipCode,
				country: point.countryCode,
				pickup_point: true,
				pickup_point_id: point.identifier,
				pickup_point_name: 'chronopost',
				pickup_point_shop_name: point.name,
			}
		})
		setSelectedPickupPoint(point);
	};

	// Fonction pour formater les horaires d'ouverture
	const formatOpeningHours = (hours: OpeningHour[] | undefined) => {
		// Si aucune donnée d'horaires n'est disponible
		if (!hours || hours.length === 0) return (
			<div className="text-sm text-gray-500">Horaires non disponibles</div>
		);

		return hours.map((hour) => (
			<div key={hour.id} className="grid grid-cols-2 text-sm">
        <span className={`font-medium ${hour.enCours ? "text-emerald-700" : ""}`}>
          {hour.dayAsText}
        </span>
				<span className={hour.enCours ? "text-emerald-700 font-medium" : ""}>
          {hour.hours}
        </span>
			</div>
		));
	};

	// Fonction pour déterminer si un point relais est ouvert actuellement
	const isCurrentlyOpen = (hours: OpeningHour[] | undefined) => {
		if (!hours || hours.length === 0) return false;
		// Chercher le jour en cours marqué comme 'enCours'
		return hours.some(hour => hour.enCours);
	};

	return (
		<div className="space-y-6" ref={containerRef}>

			{state?.errors.shipping.pickup_point && (
				<p className="text-red-500 border-2 border-red-500 text-sm p-4 bg-red-50 rounded-md">
					Veuillez sélectionner un point de retrait
				</p>
			)}


			<div className="relative">
				<div className="mb-2">
					<Label htmlFor="city" className="text-sm font-medium">
						Ville ou code postal
					</Label>
				</div>
				<Input
					type="text"
					id="city"
					value={city}
					autoCorrect="off"
					aria-haspopup="listbox"
					data-1p-ignore={true}
					data-lpignore={true}
					data-bwignore={true}
					data-form-type={'address'}
					autoCapitalize='off'
					autoComplete={'address-line1'}
					onChange={(e) => {
						setCity(e.target.value);
						setAddressSelected(false);
					}}
					placeholder="Saisissez votre ville ou code postal"
					required
					onFocus={() => {
						if (city.length >= 3) {
							setShowSuggestions(true);
						}
					}}
					onKeyDown={handleKeyDown}
					className="w-full"
				/>

				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute w-full z-10 mt-1">
						<Command className="border rounded-md shadow-md" onKeyDown={handleKeyDown}>
							<CommandList>
								<CommandGroup className="max-h-64 overflow-y-auto">
									{suggestions.map((suggestion, index) => (
										<CommandItem
											key={`${suggestion.city}-${suggestion.zipCode}`}
											value={`${suggestion.city}-${suggestion.zipCode}`}
											onSelect={(value) => {
												const selected = suggestions.find((s) => {
													const [city, zipCode] = value.split('-');
													return (
														s.city === city &&
														s.zipCode === zipCode
													);
												});
												if (selected) {
													handleAddressSelect(selected);
												}
											}}
											className={`cursor-pointer hover:bg-gray-50 ${
												index === selectedIndex ? 'bg-gray-100' : ''
											}`}
										>
											{`${suggestion.city} (${suggestion.zipCode})`}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</div>
				)}
			</div>

			{addressSelected && (
				<div className="mt-6">
					<div className="flex items-center justify-between mb-4">
						<label className="text-sm font-medium">Points de retrait disponibles</label>
						<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
							{pickupPoints.length} points disponibles
						</Badge>
					</div>

					{isLoadingPickupPoints ? (
						<div className="flex justify-center items-center h-64 bg-emerald-50 rounded-lg border border-emerald-100">
							<div className="text-center">
								<LoaderCircle className="animate-spin h-10 w-10 text-emerald-500 mx-auto mb-2"/>
								<p className="text-emerald-700">Recherche des points de retrait...</p>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{pickupPoints.length === 0 ? (
								<Card className="bg-emerald-50 border-emerald-200">
									<CardContent className="p-6 text-center">
										<p className="text-emerald-800">Aucun point de retrait disponible dans cette zone</p>
										<p className="text-sm text-emerald-600 mt-2">Essayez avec une autre ville ou code postal</p>
									</CardContent>
								</Card>
							) : (
								<RadioGroup
									value={selectedPickupPoint?.identifier || ""}
									onValueChange={(value) => {
										const point = pickupPoints.find(p => p.identifier === value);
										if (point) handlePickupPointSelect(point);
									}}
									className="space-y-4 max-h-[512px] overflow-y-auto"
								>
									{pickupPoints.map((point) => {
										const isOpen = isCurrentlyOpen(point.openingHours);

										return (
											<div key={point.identifier} className="relative">
												<div className={`border rounded-lg overflow-hidden transition-all ${
													selectedPickupPoint?.identifier === point.identifier
														? 'border-emerald-500'
														: 'border-gray-200 hover:border-emerald-300'
												}`}>
													<div className="absolute top-4 left-4">
														<RadioGroupItem
															value={point.identifier}
															id={point.identifier}
															className="text-emerald-500 border-emerald-500"
														/>
													</div>

													<Label
														htmlFor={point.identifier}
														className="block p-4 pt-4 pl-12 cursor-pointer"
													>
														<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
															<div className="flex-1">
																<p className="text-gray-600 mt-1">{point.name}</p>
																<p className="text-gray-600 mt-1">{point.address}</p>
																<p className="text-gray-600">{point.city} ({point.zipCode})</p>

																<div className="mt-2">
																	<a
																		href={point.urlGoogleMaps}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm"
																		onClick={(e) => e.stopPropagation()}
																	>
																		<MapPin className="h-4 w-4 mr-1"/>
																		Voir sur Google Maps
																	</a>

																	<div className="rounded-md mt-2">
																		<div className="flex items-center text-emerald-700">
																			<Clock className="h-4 w-4 mr-1"/>
																			<span className="text-sm font-medium">Horaires d'ouverture</span>
																		</div>
																		<div className="space-y-1">
																			{formatOpeningHours(point.openingHours)}
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</Label>
												</div>
											</div>
										);
									})}
								</RadioGroup>
							)}
						</div>
					)}

					{selectedPickupPoint && (
						<div className="mt-6">
							<Card className="border-emerald-600 border-1 rounded-md">
								<CardContent className="p-4">
									<div className="flex items-center text-emerald-700 mb-2">
										<Check className="h-5 w-5 mr-2"/>
										<h4 className="font-medium">Point de retrait sélectionné</h4>
									</div>
									<p className="text-emerald-900 font-medium">{selectedPickupPoint.name}</p>
									<p
										className="text-emerald-800 text-sm">{selectedPickupPoint.address}, {selectedPickupPoint.zipCode} {selectedPickupPoint.city}</p>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
