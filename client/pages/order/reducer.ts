import { Address, Customer } from "@/pages/types";
import { validateCustomer, validateShipping } from "./validation";

export type OrderState = {
	customer: Customer
	shipping: Address

	errors: {
		customer: Partial<{
			email: string[]
			full_name: string[]
			phone: string[]
		}>

		shipping: Partial<{
			address_line1: string[]
			address_line2: string[]
			postal_code: string[]
			city: string[]
			country: string[]
			pickup_point: string[]
			pickup_point_id: string[]
			pickup_point_name: string[]
			pickup_point_shop_name: string[]
		}>
	}
}

export type ActionOrderState =
	| { type: 'update_customer', data: Partial<Customer>}
	| { type: 'update_shipping', data: Partial<Address>}
	| { type: 'update_errors', data: OrderState['errors']}

export const defaultOrderState: OrderState = {
	customer: {
		email: "alexis.viscogliosi@Outlook.fr",
		full_name: "Alexis Viscogliosi",
		phone: "0689550945"
	},
	shipping: {
		address_line1: '',
		city: '',
		postal_code: '',
		country: '',
		pickup_point: false
	},
	errors: {
		customer: {},
		shipping: {}
	}
}

export function orderReducer(state: OrderState, action: ActionOrderState): OrderState {
	switch (action.type) {
		case 'update_customer': {
			const newState = {
				...state,
				customer: {
					...state.customer,
					...action.data
				}
			};

			// remove errors from keys updated
			if (newState.errors.customer) {
				const updatedKeys = Object.keys(action.data) as (keyof Customer)[];
				const newErrors = {...state.errors.customer};
				updatedKeys.forEach(key => {
					delete newErrors[key];
				});
				newState.errors.customer = newErrors;
			}

			return newState;
		}

		case 'update_shipping': {
			const newState = {
				...state,
				shipping: {
					...state.shipping,
					...action.data
				}
			};

			// remove errors from keys updated
			if (newState.errors.shipping) {
				const updatedKeys = Object.keys(action.data) as (keyof Address)[];
				const newErrors = {...state.errors.shipping};
				updatedKeys.forEach(key => {
					delete newErrors[key];
				});
				newState.errors.shipping = newErrors;
			}


			return newState;
		}

		case 'update_errors': {
			return {
				...state,
				errors: action.data,
			};
		}

		default:
			return state;
	}
}
