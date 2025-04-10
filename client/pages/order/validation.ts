import { z } from 'zod';
import { Customer, Address } from "@/pages/types";
import { OrderState } from './reducer';

// Fonction pour nettoyer le numéro (enlever espaces, tirets, etc.)
const cleanPhoneNumber = (phone: string): string => {
	return phone.replace(/[\s.-]/g, '');
};



// Customer validation schema
export const customerSchema = z.object({
	email: z.string()
		.min(1, "L'email est requis")
		.email("Format d'email invalide"),
	full_name: z.string()
		.min(1, "Le nom complet est requis")
		.min(3, "Le nom doit comporter au moins 3 caractères"),
	phone: z.string()
		.min(1, "Le numéro de téléphone est requis")
		.transform(cleanPhoneNumber)
		.refine((val) => {
			// Regex pour format +33
			const intlRegex = /^\+33[67]\d{8}$/;
			// Regex pour format 06/07
			const frRegex = /^0[67]\d{8}$/;

			return intlRegex.test(val) || frRegex.test(val);
		}, { message: "Numéro de téléphone français invalide" })
});

// Base shipping schema with common fields
const baseShippingSchema = z.object({
	address_line1: z.string().min(1, "L'adresse est requise"),
	address_line2: z.string().optional(),
	postal_code: z.string().min(1, "Le code postal est requis"),
	city: z.string().min(1, "La ville est requise"),
	country: z.string().min(1, "Le pays est requis"),
});

// Home delivery shipping validation schema
const homeShippingSchema = baseShippingSchema.extend({
	pickup_point: z.literal(false),
});

// Pickup point shipping validation schema
const pickupShippingSchema = baseShippingSchema.extend({
	pickup_point: z.literal(true),
	pickup_point_id: z.string().min(1, "Veuillez sélectionner un point relais"),
	pickup_point_name: z.string().min(1, "Le type de point relais est requis"),
	pickup_point_shop_name: z.string().min(1, "Le nom du point relais est requis")
});

// Combined shipping schema
export const shippingSchema = z.discriminatedUnion("pickup_point", [
	homeShippingSchema,
	pickupShippingSchema
]);


export function validateCustomer(customer: Customer) {
	const result = customerSchema.safeParse(customer);

	if (result.success) {
		return {};
	}

	// Transform Zod errors into the format expected by OrderState
	const errors: OrderState['errors']['customer'] = {};

	result.error.errors.forEach(err => {
		const path = err.path[0] as keyof Customer;
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path]!.push(err.message);
	});

	return errors;
}

export function validateShipping(shipping: Address) {
	// For pickup points, validate based on whether pickup_point_id is provided
	let schemaToUse = shipping.pickup_point ? pickupShippingSchema : homeShippingSchema;

	// Special handling for pickup points without a selected location
	if (shipping.pickup_point && !shipping.pickup_point_id) {
		return {
			pickup_point: ["Veuillez sélectionner un point relais"]
		};
	}

	const result = schemaToUse.safeParse(shipping);

	if (result.success) {
		return {};
	}

	// Transform Zod errors into the format expected by OrderState
	const errors: OrderState['errors']['shipping'] = {};

	result.error.errors.forEach(err => {
		const path = err.path[0] as keyof Address;
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path]!.push(err.message);
	});

	return errors;
}

export function validateOrderState(state: OrderState): OrderState {
	return {
		...state,
		errors: {
			customer: validateCustomer(state.customer),
			shipping: validateShipping(state.shipping)
		}
	};
}
