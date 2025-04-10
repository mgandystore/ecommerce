/* tslint:disable */
/* eslint-disable */


/**
 * AUTO-GENERATED FILE - DO NOT EDIT!
 *
 * This file was automatically generated by pg-to-ts v.4.1.1
 * $ pg-to-ts generate -c postgresql://username:password@localhost:6543/postgres -t active_storage_attachments -t active_storage_blobs -t active_storage_variant_records -t addresses -t customers -t order_items -t orders -t product_variants -t products -s public
 *
 */


export type Json = unknown;

// Table active_storage_attachments
export interface ActiveStorageAttachments {
  id: number;
  name: string;
  record_type: string;
  record_id: number;
  blob_id: number;
  created_at: string;
}
export interface ActiveStorageAttachmentsInput {
  id?: number;
  name: string;
  record_type: string;
  record_id: number;
  blob_id: number;
  created_at: string;
}
const active_storage_attachments = {
  tableName: 'active_storage_attachments',
  columns: ['id', 'name', 'record_type', 'record_id', 'blob_id', 'created_at'],
  requiredForInsert: ['name', 'record_type', 'record_id', 'blob_id', 'created_at'],
  primaryKey: 'id',
  foreignKeys: { blob_id: { table: 'active_storage_blobs', column: 'id', $type: null as unknown as ActiveStorageBlobs }, },
  $type: null as unknown as ActiveStorageAttachments,
  $input: null as unknown as ActiveStorageAttachmentsInput
} as const;

// Table active_storage_blobs
export interface ActiveStorageBlobs {
  id: number;
  key: string;
  filename: string;
  content_type: string | null;
  metadata: string | null;
  service_name: string;
  byte_size: number;
  checksum: string | null;
  created_at: string;
}
export interface ActiveStorageBlobsInput {
  id?: number;
  key: string;
  filename: string;
  content_type?: string | null;
  metadata?: string | null;
  service_name: string;
  byte_size: number;
  checksum?: string | null;
  created_at: string;
}
const active_storage_blobs = {
  tableName: 'active_storage_blobs',
  columns: ['id', 'key', 'filename', 'content_type', 'metadata', 'service_name', 'byte_size', 'checksum', 'created_at'],
  requiredForInsert: ['key', 'filename', 'service_name', 'byte_size', 'created_at'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as ActiveStorageBlobs,
  $input: null as unknown as ActiveStorageBlobsInput
} as const;

// Table active_storage_variant_records
export interface ActiveStorageVariantRecords {
  id: number;
  blob_id: number;
  variation_digest: string;
}
export interface ActiveStorageVariantRecordsInput {
  id?: number;
  blob_id: number;
  variation_digest: string;
}
const active_storage_variant_records = {
  tableName: 'active_storage_variant_records',
  columns: ['id', 'blob_id', 'variation_digest'],
  requiredForInsert: ['blob_id', 'variation_digest'],
  primaryKey: 'id',
  foreignKeys: { blob_id: { table: 'active_storage_blobs', column: 'id', $type: null as unknown as ActiveStorageBlobs }, },
  $type: null as unknown as ActiveStorageVariantRecords,
  $input: null as unknown as ActiveStorageVariantRecordsInput
} as const;

// Table addresses
export interface Addresses {
  id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}
export interface AddressesInput {
  id: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at: string;
  updated_at: string;
}
const addresses = {
  tableName: 'addresses',
  columns: ['id', 'address_line1', 'address_line2', 'city', 'postal_code', 'country', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as Addresses,
  $input: null as unknown as AddressesInput
} as const;

// Table customers
export interface Customers {
  id: string;
  stripe_customer_id: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
export interface CustomersInput {
  id: string;
  stripe_customer_id?: string | null;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}
const customers = {
  tableName: 'customers',
  columns: ['id', 'stripe_customer_id', 'email', 'full_name', 'phone', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as Customers,
  $input: null as unknown as CustomersInput
} as const;

// Table order_items
export interface OrderItems {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string;
  stripe_product_price_id: string | null;
  quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}
export interface OrderItemsInput {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string;
  stripe_product_price_id?: string | null;
  quantity?: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}
const order_items = {
  tableName: 'order_items',
  columns: ['id', 'order_id', 'product_id', 'product_variant_id', 'stripe_product_price_id', 'quantity', 'total_amount', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'order_id', 'product_id', 'product_variant_id', 'total_amount', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: {
    order_id: { table: 'orders', column: 'id', $type: null as unknown as Orders },
    product_id: { table: 'products', column: 'id', $type: null as unknown as Products },
    product_variant_id: { table: 'product_variants', column: 'id', $type: null as unknown as ProductVariants },
  },
  $type: null as unknown as OrderItems,
  $input: null as unknown as OrderItemsInput
} as const;

// Table orders
export interface Orders {
  id: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  status: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  refunded_at: string | null;
  shipping_address_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}
export interface OrdersInput {
  id: string;
  stripe_payment_id?: string | null;
  stripe_session_id?: string | null;
  status?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
  refunded_at?: string | null;
  shipping_address_id?: string | null;
  customer_id?: string | null;
  created_at: string;
  updated_at: string;
}
const orders = {
  tableName: 'orders',
  columns: ['id', 'stripe_payment_id', 'stripe_session_id', 'status', 'paid_at', 'shipped_at', 'refunded_at', 'shipping_address_id', 'customer_id', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: {
    shipping_address_id: { table: 'addresses', column: 'id', $type: null as unknown as Addresses },
    customer_id: { table: 'customers', column: 'id', $type: null as unknown as Customers },
  },
  $type: null as unknown as Orders,
  $input: null as unknown as OrdersInput
} as const;

// Table product_variants
export interface ProductVariants {
  id: string;
  product_id: string;
  variants: Json;
  stripe_product_price_id: string | null;
  stripe_price_id: string | null;
  variants_slug: string;
  stock: number | null;
  additional_price: number | null;
  created_at: string;
  updated_at: string;
}
export interface ProductVariantsInput {
  id: string;
  product_id: string;
  variants?: Json;
  stripe_product_price_id?: string | null;
  stripe_price_id?: string | null;
  variants_slug: string;
  stock?: number | null;
  additional_price?: number | null;
  created_at: string;
  updated_at: string;
}
const product_variants = {
  tableName: 'product_variants',
  columns: ['id', 'product_id', 'variants', 'stripe_product_price_id', 'stripe_price_id', 'variants_slug', 'stock', 'additional_price', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'product_id', 'variants_slug', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: { product_id: { table: 'products', column: 'id', $type: null as unknown as Products }, },
  $type: null as unknown as ProductVariants,
  $input: null as unknown as ProductVariantsInput
} as const;

// Table products
export interface Products {
  id: string;
  name: string;
  description: string | null;
  specifications: Json | null;
  features: Json | null;
  base_price: number;
  created_at: string;
  updated_at: string;
}
export interface ProductsInput {
  id: string;
  name: string;
  description?: string | null;
  specifications?: Json | null;
  features?: Json | null;
  base_price?: number;
  created_at: string;
  updated_at: string;
}
const products = {
  tableName: 'products',
  columns: ['id', 'name', 'description', 'specifications', 'features', 'base_price', 'created_at', 'updated_at'],
  requiredForInsert: ['id', 'name', 'created_at', 'updated_at'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as Products,
  $input: null as unknown as ProductsInput
} as const;


export interface TableTypes {
  active_storage_attachments: {
    select: ActiveStorageAttachments;
    input: ActiveStorageAttachmentsInput;
  };
  active_storage_blobs: {
    select: ActiveStorageBlobs;
    input: ActiveStorageBlobsInput;
  };
  active_storage_variant_records: {
    select: ActiveStorageVariantRecords;
    input: ActiveStorageVariantRecordsInput;
  };
  addresses: {
    select: Addresses;
    input: AddressesInput;
  };
  customers: {
    select: Customers;
    input: CustomersInput;
  };
  order_items: {
    select: OrderItems;
    input: OrderItemsInput;
  };
  orders: {
    select: Orders;
    input: OrdersInput;
  };
  product_variants: {
    select: ProductVariants;
    input: ProductVariantsInput;
  };
  products: {
    select: Products;
    input: ProductsInput;
  };
}

export const tables = {
  active_storage_attachments,
  active_storage_blobs,
  active_storage_variant_records,
  addresses,
  customers,
  order_items,
  orders,
  product_variants,
  products,
}
