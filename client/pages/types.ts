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
	url_thumb: string
	url_large: string
	url_blur: string
	alt: string
}

export interface ProductVariant {
	id: string
	product_id: string
	variants: Variants
	stripe_product_price_id: string
	variants_slug: string
	stock: number
	additional_price: number
	created_at: string
	updated_at: string
	stripe_product_id: string
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
