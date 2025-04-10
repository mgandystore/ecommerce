import {
	Address,
	AssmacResponse,
	BaseData,
	CreateOrderResponse,
	Customer,
	LegalNoticesResponse,
	Order, OrderResponse, PriceOrderResponse, SalesTermsResponse
} from "@/pages/types";
import pino from "pino";

export class AssmacAPI {
	private readonly baseUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string

	public async product(): Promise<AssmacResponse | undefined> {
		try {
			const resp = await fetch(`${this.baseUrl}/api/assmac`)
			if (!resp.ok) {
				throw new Error(`HTTP error! status: ${resp.status} ${resp.statusText} ${await resp.text()}`)
			}

			return await resp.json() as AssmacResponse
		} catch (error) {
			pino().error(error, "Error fetching Assmac API")
			return undefined
		}
	}

	public async settings(): Promise<BaseData | undefined> {
		try {
			const resp = await fetch(`${this.baseUrl}/api/settings`)
			if (!resp.ok) {
				throw new Error(`HTTP error! status: ${resp.status} ${resp.statusText} ${await resp.text()}`)
			}

			return await resp.json() as BaseData
		} catch (error) {
			pino().error(error, "Error fetching Assmac API settings")
			return undefined
		}
	}

	public async createOrder(variantId: string): Promise<CreateOrderResponse | undefined> {
		try {
			const response = await fetch(`${this.baseUrl}/api/orders/${variantId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} ${response.statusText} ${await response.text()}`)
			}

			return await response.json() as CreateOrderResponse
		} catch (error) {
			return undefined
			pino().error(error, "Error creating order")
		}
	}

	public async findOrderById(orderId: string): Promise<OrderResponse | undefined> {
		try {
			const response = await fetch(`${this.baseUrl}/api/orders/${orderId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} ${response.statusText} ${await response.text()}`)
			}

			return await response.json() as OrderResponse
		} catch (error) {
			pino().error(error, "Error fetching order status")
			return undefined
		}
	}

	public async payOrder(
		orderId: string,
		address: Address,
		customer: Customer,
	): Promise<Order | { error: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/pay`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					address,
					customer,
				})
			})
			if (!response.ok) {
				return await response.json() as { error: string }
			}

			return await response.json() as Order
		} catch (error) {
			pino().error(error, "Error paying order")
			return {error: (error as Error).message}
		}
	}

	public async calculatePriceOrder(orderId: string, pickupPoint: boolean): Promise<PriceOrderResponse | undefined> {
		try {
			const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/price_calculator?pickup_point=${pickupPoint}`)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} ${response.statusText} ${await response.text()}`)
			}

			return await response.json() as PriceOrderResponse
		} catch (error) {
			pino().error(error, "Error calculating order price")
			return undefined
		}
	}


	public async legalNotices(): Promise<LegalNoticesResponse | undefined> {
		try {
			const resp = await fetch(`${this.baseUrl}/api/legal-notices`)
			if (!resp.ok) {
				throw new Error(`HTTP error! status: ${resp.status} ${resp.statusText} ${await resp.text()}`)
			}

			return await resp.json() as LegalNoticesResponse
		} catch (error) {
			pino().error(error, "Error fetching Assmac API legal notices")
			return undefined
		}
	}

	public async salesTerms(): Promise<SalesTermsResponse | undefined> {
		try {
			const resp = await fetch(`${this.baseUrl}/api/sales-terms`)
			if (!resp.ok) {
				throw new Error(`HTTP error! status: ${resp.status} ${resp.statusText} ${await resp.text()}`)
			}

			return await resp.json() as SalesTermsResponse
		} catch (error) {
			pino().error(error, "Error fetching Assmac API sales terms")
			return undefined
		}
	}

	public async addToStockNotification(
		email: string,
		productVariantId: string,
	): Promise<{ success: boolean } | undefined> {
		try {
			const url = new URL(`${this.baseUrl}/api/stock_notifications`)
			url.searchParams.append('email', email)
			url.searchParams.append('product_variant_id', productVariantId)

			const resp = await fetch(url.toString(), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})

			if (!resp.ok) {
				throw new Error(`HTTP error! status: ${resp.status} ${resp.statusText} ${await resp.text()}`)
			}

			return {success: true}
		} catch (error) {
			pino().error(error, "Error adding to stock notification")
			return undefined
		}
	}
}
