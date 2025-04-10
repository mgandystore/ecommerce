/**
 * ChronoshopAPI - TypeScript client for Chronoshop Shop2Shop API
 * Updated to work with Ruby controller
 */

// Types for API responses
export interface ChronoLocation {
	name: string;
	identifier: string;
	type: string;
	zipCode: string;
	city: string;
	countryCode: string;
	distanceInMeters: number;
	urlGoogleMaps: string;
	lat: number;
	lng: number;
	address: string;
	openingHours: OpeningHour[];
}

export interface OpeningHour {
	id: number;
	dayAsText: string;
	hours: string;
	enCours: boolean;
}

export interface CityZipCodeResult {
	country: string;
	zipCode: string;
	city: string;
	score: number;
}

export interface ErrorResponse {
	error: string;
}

/**
 * Chronoshop API Client
 */
export class ChronoshopAPI {
	private readonly baseUrl: string = import.meta.env.PUBLIC_ENV__SRV_URL + '/api/chronoshop';

	constructor() {}

	/**
	 * Search for pickup points (points relais) by zip code and city
	 *
	 * @param zipCode - ZIP/Postal code
	 * @param city - City name
	 * @param countryCode - Country code (default: 'FR')
	 * @param limit - Maximum number of results to return (default: 5)
	 * @returns Promise containing pickup points data
	 */
	async searchPickupPoints(
		zipCode: string,
		city: string,
		countryCode = 'FR',
		limit = 25
	): Promise<ChronoLocation[]> {
		const url = new URL(`${this.baseUrl}/pickup_points`, window.location.origin);

		url.searchParams.append('zip_code', zipCode);
		url.searchParams.append('city', city);
		url.searchParams.append('country', countryCode);
		url.searchParams.append('limit', limit.toString());

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error((data as ErrorResponse).error || `Failed to fetch pickup points: ${response.status}`);
		}

		return data;
	}

	/**
	 * Search for cities and zip codes by partial name
	 *
	 * @param query - Partial city or zip code
	 * @param country - Country code (default: 'FR')
	 * @param limit - Maximum number of results to return (default: 10)
	 * @returns Promise containing city/zipcode suggestions
	 */
	async searchCityZipCode(
		query: string,
		country = 'FR',
		limit = 10
	): Promise<CityZipCodeResult[]> {
		const url = new URL(`${this.baseUrl}/search_city`, window.location.origin);

		url.searchParams.append('query', query);
		url.searchParams.append('country', country);
		url.searchParams.append('limit', limit.toString());

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error((data as ErrorResponse).error || `Failed to fetch city/zip code data: ${response.status}`);
		}

		return data;
	}
}
