import React, {useEffect, useReducer, useState} from 'react';
import {ChevronRight, Lock, ShoppingCart} from 'lucide-react';
import {loadStripe} from "@stripe/stripe-js";
import HomeDeliveryShippingForm from "./HomeDeliveryShippingForm";
import ContactForm from "./ContactForm";
import PickupPointShippingForm from "./PickupPointShippingForm";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {useData} from "vike-react/useData";
import {Data} from "@/pages/order/+data";
import {OrderResponse, PriceOrderResponse} from "@/pages/types";
import {Button} from "@/components/Button";
import {Appearance} from "@stripe/stripe-js/dist/stripe-js/elements-group";
import {ActionOrderState, defaultOrderState, orderReducer, OrderState} from "@/pages/order/reducer";
import {validateOrderState} from "@/pages/order/validation";
import {cn} from "@/lib/utils";
import {AssmacAPI} from "@/lib/assmac_client";
import {StripePayment} from "@/pages/order/StripePayment";

const stripePromise = loadStripe(import.meta.env.PUBLIC_ENV__STRIPE as string);
const stripeAppearance: Appearance = {
	variables: {
		colorPrimary: '#059669', // emerald-600 for selected states
		colorBackground: '#FFFFFF',
		colorText: '#1F2937', // gray-800 for text
		colorDanger: '#EF4444', // red-500 for errors
		fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
		spacingUnit: '4px',
		borderRadius: '8px', // rounded-md
	},
	rules: {
		'.Input': {
			border: '1px solid #D1D5DB', // gray-300 border
			boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
			padding: '16px',
			borderRadius: '8px',
		},
		'.Input:focus': {
			border: '1px solid #6B7280', // gray-500 border on focus
			boxShadow: '0 0 0 3px rgba(209, 213, 219, 0.5)', // gray-300 with opacity for focus:ring-2 focus:ring-gray-300
		},
		'.Label': {
			color: '#364153', // gray-700 for labels
			fontSize: '0.875rem', // text-sm
			fontWeight: '600', // font-medium
			marginBottom: '4px',
		},
		'.Tab': {
			border: '1px solid #D1D5DB', // gray-300 border
			boxShadow: 'none',
			borderRadius: '6px', // rounded-md
			color: '#364153',
		},
		'.Tab:hover': {
			border: '1px solid #9CA3AF', // gray-500 on hover
			color: '#364153',
		},
		'.Tab--selected': {
			backgroundColor: '#F0FDF4', // emerald-50 background
			borderColor: '#059669', // emerald-600 border
			boxShadow: 'none',
			color: '#364153',
		},
		'.CheckboxInput': {
			borderColor: '#D1D5DB', // gray-300 border
			borderRadius: '4px',
		},
		'.CheckboxInput--checked': {
			backgroundColor: '#059669', // emerald-600 when checked
			borderColor: '#059669',
		}
	}
};


export default function Page() {
	const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup_point'>('home');
	const data = useData<Data>() as OrderResponse
	const [orderState, dispatch] = useReducer(orderReducer, defaultOrderState);
	const [price, setPrice] = useState<PriceOrderResponse>({
		total: data.order.total_amount,
		shipping: 200,
		items: data.order.items.reduce((acc, item) => acc + item.total_amount, 0),
	});

	useEffect(() => {
		if (deliveryMethod == 'pickup_point') {
			dispatch({
				type: 'update_shipping',
				data: {
					address_line1: '',
					city: '',
					postal_code: '',
					country: 'FR',
					pickup_point: true
				}
			})
		} else {
			dispatch({
				type: 'update_shipping',
				data: {
					address_line1: '',
					city: '',
					postal_code: '',
					country: 'FR',
					pickup_point: false,
					pickup_point_shop_name: undefined,
					pickup_point_name: undefined,
					pickup_point_id: undefined
				}
			})
		}
	}, [deliveryMethod]);
	useEffect(() => {
		new AssmacAPI().calculatePriceOrder(data.order.id, orderState.shipping.pickup_point).then(result => {
			if (result) {
				setPrice(result)
			}
		})

	}, [orderState.shipping]);


	return (
		<div className="grid grid-cols-1 md:grid-cols-12 min-h-screen">
			<div className="md:col-span-7 bg-white">
				<div className="p-6 md:p-12 max-w-3xl ml-auto">
					<div className="border rounded-md p-6 mb-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium">Informations de contact</h2>
						</div>
						<ContactForm state={orderState} dispatcher={dispatch}/>
					</div>

					<div className="border rounded-md p-6 mb-6">
						<h2 className="text-lg font-medium mb-4">Livraison</h2>

						<div
							className={cn(
								"flex items-center p-4 border rounded-md mb-2 cursor-pointer",
								deliveryMethod === 'home'
									? "bg-emerald-50 border-emerald-600"
									: "bg-white border-gray-300 hover:border-gray-400"
							)}
							onClick={() => setDeliveryMethod('home')}
						>
							<div
								className={cn(
									"h-4 w-4 rounded-full border-2 flex items-center justify-center mr-3",
									deliveryMethod === 'home'
										? "bg-emerald-600 border-emerald-600"
										: "border-gray-300"
								)}>
								{deliveryMethod === 'home' && <div className="w-2 h-2 bg-white rounded-full"></div>}
							</div>
							<div className="flex-1">
								<p className="font-medium">Livraison à domicile</p>
							</div>
						</div>

						{deliveryMethod === 'home' && (
							<div className="pt-4 pb-8">
								<HomeDeliveryShippingForm state={orderState} dispatcher={dispatch}/>
							</div>
						)}

						<div
							className={cn(
								"flex items-center p-4 border rounded-md cursor-pointer",
								deliveryMethod === 'pickup_point'
									? "bg-emerald-50 border-emerald-600"
									: "bg-white border-gray-300 hover:border-gray-400"
							)}
							onClick={() => setDeliveryMethod('pickup_point')}
						>
							<div
								className={cn(
									"h-4 w-4 rounded-full border-2 flex items-center justify-center mr-3",
									deliveryMethod === 'pickup_point'
										? "bg-emerald-600 border-emerald-600"
										: "border-gray-300"
								)}>
								{deliveryMethod === 'pickup_point' && <div className="w-2 h-2 bg-white rounded-full"></div>}
							</div>
							<div className="flex-1">
								<p className="font-medium">Livraison en point relais</p>
							</div>
						</div>

						{deliveryMethod === 'pickup_point' && (
							<div className="pt-4">
								<PickupPointShippingForm state={orderState} dispatcher={dispatch}/>
							</div>
						)}
					</div>

					<Elements stripe={stripePromise} options={{
						clientSecret: data.order.stripe_payment_intent_client_secret,
						appearance: stripeAppearance,
					}}>
						<StripePayment data={data} state={orderState} dispatch={dispatch}/>
					</Elements>
				</div>
			</div>

			<div className="md:col-span-5 bg-gray-50 border-t md:border-t-0 md:border-l">
				<div className="p-6 md:p-12 max-w-lg">
					<div className="mb-8">
						<h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
						<div className="space-y-4 mb-6">
							{data.order.items.map((item, idx) => (
								<div className="flex" key={item.product_variant_id}>
									<div className="relative">
										{/*{JSON.stringify(item.images)}*/}
										{ item.images.length == 0 ? (
											<div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
												<ShoppingCart size={24} className="text-gray-500"/>
											</div>
											) : (
											<div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
												<img src={item.images[0].url_thumbnail} alt={item.product_name} className="w-full h-full object-cover"/>
											</div>
										)}

										<div
											className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
											{item.quantity}
										</div>
									</div>
									<div className="ml-4 flex-1">
										<p className="font-medium">{item.variant_human_format}</p>
										<p className="text-sm text-gray-500">{item.short_description}</p>
									</div>
									<div className="font-medium">{item.total_amount / 100} €</div>
								</div>
							))
							}
						</div>
						<div className="flex mb-6">
							<input
								type="text"
								placeholder="Discount code"
								className="flex-1 p-3 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
							/>
							<button className="bg-gray-200 text-gray-800 px-4 rounded-r-md font-medium">
								Apply
							</button>
						</div>

						<div className="space-y-3 border-t pt-4">
							<div className="flex justify-between">
								<span className="text-gray-600">Articles</span>
								<span className="font-medium"> {price.items / 100} €</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Livraison</span>
								<span className="font-medium"> {price.shipping > 0 ? price.shipping / 100 : 0} €</span>
							</div>
						</div>
						<div className="flex justify-between mt-4 pt-4 border-t">
							<span className="font-medium">Total</span>
							<span className="font-bold text-xl">{price.total / 100} €</span>
						</div>
					</div>
					<div className="flex items-center justify-center text-sm text-gray-500">
						<Lock size={14} className="mr-1"/>
						<span>Paiement sécurisé par stripe</span>
					</div>
				</div>
			</div>
		</div>
	);
}
