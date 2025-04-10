export interface MapboxFeature {
	id: string;
	place_name: string;
	text: string;
	address?: string;
	context: Array<{
		id: string;
		text: string;
		short_code?: string;
	}>;
}

interface MapboxResponse {
	features: MapboxFeature[];
}

interface AddressData {
	addressLine1: string;
	addressLine2: string;
	postalCode: string;
	city: string;
	country?: string;
}

class MapboxClient {
	private apiKey: string;
	private sessionToken: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.sessionToken = this.generateRandomString(32);
	}

	private generateRandomString(length: number): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	async getSuggestions(query: string): Promise<MapboxFeature[]> {
		if (!query || query.length < 3) {
			return [];
		}

		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					query
				)}.json?access_token=${this.apiKey}&country=fr&language=fr&types=address&autocomplete=true&session_token=${this.sessionToken}`
			);
			const data = await response.json() as MapboxResponse;
			return data.features || [];
		} catch (error) {
			console.error('Error fetching address suggestions:', error);
			return [];
		}
	}

	parseAddress(feature: MapboxFeature | null): AddressData | null {
		if (!feature) return null;

		let streetAddress = feature.text || '';
		let secondaryAddress = '';
		let cityName = '';
		let postalCodeValue = '';
		let country = 'FR';

		feature.context.forEach(context => {
			if (context.id.startsWith('postcode')) {
				postalCodeValue = context.text;
			} else if (context.id.startsWith('place')) {
				cityName = context.text;
			} else if (context.id.startsWith('country')) {
				country = context.short_code?.toUpperCase() || country;
			}
		});

		const houseNumber = feature.address || '';
		if (houseNumber && !streetAddress.startsWith(houseNumber)) {
			streetAddress = `${houseNumber} ${streetAddress}`;
		}

		return {
			addressLine1: streetAddress,
			addressLine2: secondaryAddress,
			postalCode: postalCodeValue,
			country: country,
			city: cityName
		};
	}
}

export default MapboxClient;
