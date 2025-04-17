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

let userCoordinates: [number, number] | undefined = undefined;
let attemptGeoloc = 0;
const MAX_GEOLOC_ATTEMPT = 5;

async function getUserCoordinates(): Promise<[number, number] | undefined> {
	if (userCoordinates) {
		return userCoordinates;
	}


	if (attemptGeoloc >= MAX_GEOLOC_ATTEMPT) {
		return undefined;
	}

	const resLongLat = await fetch((import.meta.env.PUBLIC_ENV__SRV_URL) + '/api/geoloc')
		.then(response => response.json())
		.then(data => {
			if (data.latitude && data.longitude) {
				return [data.longitude, data.latitude] as [number, number];
			}
			return undefined;
		})
		.catch(() => undefined);

	if (resLongLat) {
		userCoordinates = resLongLat;
		return resLongLat;
	}
}

class MapboxClient {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}


	async getSuggestions(query: string): Promise<MapboxFeature[]> {
		if (!query || query.length < 3) {
			return [];
		}

		const url = new URL(`https://api.mapbox.com/search/geocode/v6/forward`);

		url.searchParams.append('access_token', this.apiKey);
		url.searchParams.append('q', query);
		url.searchParams.append('autocomplete', 'true');
		url.searchParams.append('country', 'FR');
		url.searchParams.append('language', 'fr');
		url.searchParams.append('format', 'v5');

		const longLat = await getUserCoordinates();
		if (longLat) {
			url.searchParams.append('proximity', `${longLat[0]},${longLat[1]}`);
		}

		try {
			const response = await fetch(url.toString());
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
