import { Products, ProductVariants } from './dbschema'

export interface Image {
  url: string
}

export interface Product extends Products {
  product_variants: ProductVariant[]
  images: Image[]
}

export interface ProductVariant extends ProductVariants {
  images: Image[]
}