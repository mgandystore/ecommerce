export interface BaseData {
	setting: Setting
}

export interface AssmacResponse extends BaseData {
	product: Product
	images: Images
	product_variants: ProductVariant[]
	default_variant_id: string
	reviews: Review[]
	seo: Seo
}

export interface Product {
	id: string
	name: string
	description: string
	specifications: Specification[]
	faq: Faq[]
	base_price: number
	created_at: string
	updated_at: string
	short_description: string
}

export interface Review {
	id: string
	name: string
	content: string
	stars: string // lol.
	created_at: string
	updated_at: string
}

export interface Specification {
	id: string
	key: string
	value: string
	position: number
}

export interface Faq {
	id: string
	key: string
	value: string
	position: number
}

export type Images = Record<string, ProductImage[]>

export interface ProductImage {
	url: string
	url_medium: string
	url_thumbnail: string
	url_large: string
	url_blur: string
	alt: string
}

export interface ProductVariant {
	id: string
	product_id: string
	variants: Variants
	variants_slug: string
	stock: number
	additional_price: number
	created_at: string
	updated_at: string
}

export interface Variants {
	couleur: string
}

export interface Setting {
	id: string
	cgv: string
	instagram: string
	created_at: string
	updated_at: string
	legal_notices: string
	address: string
	siret: string
	siren: string
	contact_mail: string
	shop_name: string
	short_desc: string
	keywords: string
}

export interface Seo {
	description: string
	keywords: string
	image_src: string
	og: Og
	twitter: Twitter
}

export interface Og {
	type: string
	title: string
	description: string
	url: string
	image: string
	image_width: string
	image_height: string
	site_name: string
	price: { amount: string; currency: string }
	availability: string
}

export interface Twitter {
	card: string
	title: string
	description: string
	image: string
	site: string
	data1: string
	label1: string
	data2: string
	label2: string
}


export interface CheckoutResponse {
	checkout_session_url: string
}

export interface SalesTermsResponse extends BaseData {
	value: string
}

export interface LegalNoticesResponse extends BaseData {
	value: string
}

/*
order_id: order.id,
      order_total_amount: order.total_amount,
      order_items: order.order_items.map do |item|
        {
          product_variant_id: item.product_variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
          total_amount: item.total_amount,
        }
      end
 */

export interface Customer {
	email: string;
	full_name: string;
	phone: string;
}

// Address type based on AddressForm
export interface Address {
	address_line1: string;
	address_line2?: string;
	city: string;
	postal_code: string;
	country: string;
	pickup_point: boolean;
	pickup_point_id?: string;
	pickup_point_shop_name?: string;
	pickup_point_name?: string;
}

export interface CreateOrderResponse extends Order {
}

export interface OrderResponse extends BaseData {
	order: Order
	price: PriceOrderResponse
}

export interface OrderItem {
	product_variant_id: string
	product_id: string
	variant_human_format: string
	product_name: string
	short_description: string
	quantity: number
	total_amount: number
	images: Partial<ProductImage>[]
}

export interface Order {
	id: string
	total_amount: number
	stripe_payment_intent_id: string
	stripe_payment_intent_client_secret: string
	items: OrderItem[]
}

export interface PriceOrderResponse {
	total: number
	shipping: number
	discount: number | undefined
	promo_code: {
		code: string
		description: string
		discount_type: 'percentage' | 'fixed_amount'
		discount_value: number
	} | undefined
	items: number
}

export interface OrderPromoCodeAndPricingResponse {
	order: Order
	price: PriceOrderResponse
}
