import {OrderResponse} from "@/pages/types";
import {ActionOrderState, OrderState} from "@/pages/order/reducer";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import React, {useState} from "react";
import {validateOrderState} from "@/pages/order/validation";
import {AssmacAPI} from "@/lib/assmac_client";
import {Button} from "@/components/Button";
import {ChevronRight} from "lucide-react";

export function StripePayment({data, state, dispatch}: {
	data: OrderResponse,
	state: OrderState,
	dispatch: (action: (ActionOrderState)) => void
}) {
	const stripe = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	const pay = async () => {
		if (loading) return;
		setLoading(true);
		setError(undefined);

		try {
			// Validate the order state
			if (!validateCustomerAndShipping()) return;

			// Check if Stripe is ready
			if (!isStripeReady()) return;

			// Process the order with API
			if (!await processOrder()) return;

			if (!await confirmStripePayment()) return;
		} finally {
			setLoading(false);
		}
	};

// Validation function
	const validateCustomerAndShipping = () => {
		const validatedOrderState = validateOrderState(state);

		if (Object.keys(validatedOrderState.errors.customer).length > 0 ||
			Object.keys(validatedOrderState.errors.shipping).length > 0) {
			dispatch({
				type: 'update_errors',
				data: validatedOrderState.errors
			});
			setError('Un ou plusieurs champs sont invalides. Veuillez vérifier vos informations.');
			return false;
		}

		return true;
	};

	const isStripeReady = () => {
		return !(!stripe || !elements);
	};

	const processOrder = async () => {
		const mayOrder = await new AssmacAPI().payOrder(data.order.id, state.shipping, state.customer);
		if ('error' in mayOrder) {
			setError('Une erreur est survenue lors du traitement de la commande. Veuillez réessayer.');
			return false;
		}
		return true;
	};

	const confirmStripePayment = async () => {
		const {error} = await stripe!.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/order/success`,
			},
		});

		if (error) {
			setError(error.message);
			return false;
		}

		return true;
	};

	return <>
		<div className="border rounded-md p-6 mb-6">
			<h2 className="text-lg font-medium mb-4">Paiement</h2>
			<PaymentElement options={{
				layout: "tabs",
			}}/>
		</div>

		{ error && (
			<div className="mb-4">
				<p className="text-red-500 text-sm">{error}</p>
			</div>
		)}

		<div className="flex justify-between items-center">
			<Button
				onClick={pay}
				disabled={loading}
				loading={loading}
				className="w-full py-4 bg-amber-400 hover:bg-amber-300 focus:bg-amber-500 text-base font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
			>
				Payer
				<ChevronRight className="ml-1" size={16}/>
			</Button>
		</div>
	</>;
}
