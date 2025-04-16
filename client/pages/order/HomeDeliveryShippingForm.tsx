import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList
} from "@/components/ui/command";
import MapboxClient, { MapboxFeature } from "@/lib/mapbox";
import {ActionOrderState, OrderState} from "@/pages/order/reducer";
import {cn} from "@/lib/utils";

interface HomeDeliveryShippingFormProps {
	state: OrderState,
	dispatcher: (action: (ActionOrderState)) => void
}

export default function HomeDeliveryShippingForm({state, dispatcher}: HomeDeliveryShippingFormProps) {
	const mapBoxApiKey = import.meta.env.PUBLIC_ENV__MAPBOX as string;
	const mapboxClient = useRef(new MapboxClient(mapBoxApiKey));

	const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [addressSelected, setAddressSelected] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (state.shipping.address_line1.length < 3 || addressSelected) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			setIsLoading(true);
			try {
				const results = await mapboxClient.current.getSuggestions(state.shipping.address_line1);
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
	}, [state.shipping.address_line1, addressSelected]);

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

	const handleAddressSelect = async (feature: MapboxFeature) => {
		try {
			setIsLoading(true);
			const parsedAddress = mapboxClient.current.parseAddress(feature);

			if (parsedAddress) {
				dispatcher({
					type: 'update_shipping',
					data: {
						address_line1: parsedAddress.addressLine1,
						address_line2: parsedAddress.addressLine2,
						postal_code: parsedAddress.postalCode,
						city: parsedAddress.city,
						country: parsedAddress.country,
						pickup_point: false
					}
				})
				setAddressSelected(true);
			}
		} catch (error) {
			console.error("Error getting address details:", error);
		} finally {
			setShowSuggestions(false);
			setIsLoading(false);
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

	return (
		<div className="space-y-4" ref={containerRef}>
			<div className="relative">
				<label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-1">
					Addresse Ligne 1
				</label>
				<Input
					type="text"
					id="address_line_1"
					autoComplete="off"
					aria-autocomplete={"list"}
					aria-expanded={showSuggestions && suggestions.length > 0}
					value={state.shipping.address_line1}
					onChange={(e) => {
						dispatcher({ type: 'update_shipping', data: { address_line1: e.target.value } });
						setAddressSelected(false);
					}}
					placeholder="123 Rue de la Paix"
					onFocus={() => {
						if (state.shipping.address_line1.length >= 3) {
							setShowSuggestions(true);
						}
					}}
					className={cn(state.errors.shipping?.address_line1 ? 'border-red-500 border-2' : '')}
					onKeyDown={handleKeyDown}
				/>
				{state.errors.shipping?.address_line1 && (
					<p className="text-red-500 text-sm mt-1">
						{state.errors.shipping.address_line1[0]}
					</p>
				)}

				{showSuggestions && (
					<div className="absolute w-full z-10 mt-1">
						<Command className="border rounded-md shadow-md" onKeyDown={handleKeyDown}>
							<CommandList>
								{isLoading ? (
									<CommandEmpty>Chargement des suggestions...</CommandEmpty>
								) : suggestions.length === 0 ? (
									<CommandEmpty>Aucune adresse trouvée</CommandEmpty>
								) : (
									<CommandGroup>
										{suggestions.map((suggestion, index) => (
											<CommandItem
												key={suggestion.id}
												value={suggestion.id}
												onSelect={(value) => {
													const selected = suggestions.find((s) => s.id === value);
													if (selected) {
														handleAddressSelect(selected);
													}
												}}
												className={`cursor-pointer hover:bg-gray-100 ${
													index === selectedIndex ? 'bg-gray-200' : ''
												}`}
											>
												{suggestion.place_name}
											</CommandItem>
										))}
									</CommandGroup>
								)}
							</CommandList>
						</Command>
					</div>
				)}
			</div>

			<div>
				<label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-1">
					Addresse Ligne 2
				</label>
				<Input
					type="text"
					id="address_line_2"
					value={state.shipping.address_line2}
					onChange={(e) => dispatcher({ type: 'update_shipping', data: { address_line2: e.target.value } })}
					placeholder="Apt 4B"
					className={cn(state.errors.shipping?.address_line2 ? 'border-red-500 border-2' : '')}
				/>
				{state.errors.shipping?.address_line2 && (
					<p className="text-red-500 text-sm mt-1">
						{state.errors.shipping.address_line2[0]}
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
						Code Postal
					</label>
					<Input
						type="text"
						id="postal_code"
						value={state.shipping.postal_code}
						onChange={(e) => dispatcher({ type: 'update_shipping', data: { postal_code: e.target.value } })}
						placeholder="75001"
						className={cn(state.errors.shipping?.postal_code ? 'border-red-500 border-2' : '')}
					/>
					{state.errors.shipping?.postal_code && (
						<p className="text-red-500 text-sm mt-1">
							{state.errors.shipping.postal_code[0]}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
						Ville
					</label>
					<Input
						type="text"
						id="city"
						value={state.shipping.city}
						onChange={(e) => dispatcher({ type: 'update_shipping', data: { city: e.target.value } })}
						placeholder="Paris"
						className={cn(state.errors.shipping?.city ? 'border-red-500 border-2' : '')}
					/>
					{state.errors.shipping?.city && (
						<p className="text-red-500 text-sm mt-1">
							{state.errors.shipping.city[0]}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
