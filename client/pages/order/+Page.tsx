import React, {useEffect, useReducer, useState} from 'react';
import {ChevronRight, Lock, Package, ShieldCheck, ShoppingCart, Truck} from 'lucide-react';
import {loadStripe} from "@stripe/stripe-js";
import HomeDeliveryShippingForm from "./HomeDeliveryShippingForm";
import ContactForm from "./ContactForm";
import PickupPointShippingForm from "./PickupPointShippingForm";
import {Elements} from "@stripe/react-stripe-js";
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
import {Input} from "@/components/ui/input";

const stripePromise = loadStripe(import.meta.env.PUBLIC_ENV__STRIPE as string);
const stripeAppearance: Appearance = {
	variables: {
		colorPrimary: '#059669',
		colorBackground: '#FFFFFF',
		colorText: '#1F2937',
		colorDanger: '#EF4444',
		fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
		spacingUnit: '4px',
		borderRadius: '8px',
	},
	rules: {
		'.Input': {
			border: '1px solid #D1D5DB',
			boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
			padding: '16px',
			borderRadius: '8px',
		},
		'.Input:focus': {
			border: '1px solid #6B7280',
			boxShadow: '0 0 0 3px rgba(209, 213, 219, 0.5)',
		},
		'.Label': {
			color: '#364153',
			fontSize: '0.875rem',
			fontWeight: '600',
			marginBottom: '4px',
		},
		'.Tab': {
			border: '1px solid #D1D5DB',
			boxShadow: 'none',
			borderRadius: '6px',
			color: '#364153',
		},
		'.Tab:hover': {
			border: '1px solid #9CA3AF',
			color: '#364153',
		},
		'.Tab--selected': {
			backgroundColor: '#F0FDF4',
			borderColor: '#059669',
			boxShadow: 'none',
			color: '#364153',
		},
		'.CheckboxInput': {
			borderColor: '#D1D5DB',
			borderRadius: '4px',
		},
		'.CheckboxInput--checked': {
			backgroundColor: '#059669',
			borderColor: '#059669',
		}
	}
};

export default function Page() {
	const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup_point'>('home');
	const data = useData<Data>() as OrderResponse
	const [orderState, dispatch] = useReducer(orderReducer, defaultOrderState);
	const [price, setPrice] = useState<PriceOrderResponse>(data.price);

	const [promoCode, setPromoCode] = useState('');
	const [promoError, setPromoError] = useState<string | null>(null);
	const [applyingPromo, setApplyingPromo] = useState(false);

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

	const applyPromo = async () => {
		setApplyingPromo(true);
		setPromoError(null);
		const result = await new AssmacAPI().applyPromoCodeToOrder(data.order.id, promoCode.trim());

		if ('error' in result) {
			setPromoError('Le code est invalide ou a déjà été utilisé.');
		} else {
			setPrice(result.price);
		}
		setApplyingPromo(false);
	};

	const removePromo = async () => {
		setApplyingPromo(true);
		setPromoError(null);
		const result = await new AssmacAPI().removePromoCodeFromOrder(data.order.id);

		if ('error' in result) {
			setPromoError(result.error);
		} else {
			setPrice(result.price);
			setPromoCode('');
		}
		setApplyingPromo(false);
	};

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
						<div className={cn("flex items-center p-4 border rounded-md mb-2 cursor-pointer", deliveryMethod === 'home' ? "bg-emerald-50 border-emerald-600" : "bg-white border-gray-300 hover:border-gray-400")}
								 onClick={() => setDeliveryMethod('home')}>
							<div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center mr-3", deliveryMethod === 'home' ? "bg-emerald-600 border-emerald-600" : "border-gray-300")}>{deliveryMethod === 'home' && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
							<div className="flex-1"><p className="font-medium">Livraison à domicile</p></div>
						</div>
						{deliveryMethod === 'home' && <div className="pt-4 pb-8"><HomeDeliveryShippingForm state={orderState} dispatcher={dispatch}/></div>}
						<div className={cn("flex items-center p-4 border rounded-md cursor-pointer", deliveryMethod === 'pickup_point' ? "bg-emerald-50 border-emerald-600" : "bg-white border-gray-300 hover:border-gray-400")}
								 onClick={() => setDeliveryMethod('pickup_point')}>
							<div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center mr-3", deliveryMethod === 'pickup_point' ? "bg-emerald-600 border-emerald-600" : "border-gray-300")}>{deliveryMethod === 'pickup_point' && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
							<div className="flex-1"><p className="font-medium">Livraison en point relais</p></div>
						</div>
						{deliveryMethod === 'pickup_point' && <div className="pt-4"><PickupPointShippingForm state={orderState} dispatcher={dispatch}/></div>}
					</div>
					<Elements stripe={stripePromise} options={{clientSecret: data.order.stripe_payment_intent_client_secret, appearance: stripeAppearance}}>
						<StripePayment data={data} price={price} state={orderState} dispatch={dispatch}/>
					</Elements>
				</div>
			</div>
			<div className="md:col-span-5 bg-gray-50 border-t md:border-t-0 md:border-l">
				<div className="p-6 md:p-12 max-w-lg">
					<div className="mb-8">
						<h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
						<div className="space-y-4 mb-6">
							{data.order.items.map((item) => (
								<div className="flex" key={item.product_variant_id}>
									<div className="relative">
										{item.images.length === 0 ? (
											<div className="w-24 h-24 rounded-md bg-gray-200 flex items-center justify-center">
												<ShoppingCart size={28} className="text-gray-500"/>
											</div>
										) : (
											<div className="w-24 h-24 rounded-md bg-gray-200 flex items-center justify-center">
												<img src={item.images[0].url_thumbnail} alt={item.product_name} className="w-full h-full object-cover rounded-md"/>
											</div>
										)}
										<div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
											{item.quantity}
										</div>
									</div>
									<div className="ml-4 flex-1">
										<p className="font-medium">{item.product_name} {item.variant_human_format}</p>
										<p className="text-sm text-gray-500">{item.short_description}</p>
									</div>
									<div className="font-medium">{item.total_amount / 100} €</div>
								</div>
							))}
						</div>

						{/*Promotional code*/}
						<div>
							<div className="flex mb-4">
								<div className="flex-1 mr-2">
									<Input
										type="text"
										placeholder="Code promo"
										value={promoCode}
										onChange={(e) => setPromoCode(e.target.value)}
										className="bg-white h-10 py-4"
									/>
									{promoError && <p className="text-red-500 text-sm py-1">{promoError}</p>}
								</div>

								<Button
									onClick={applyPromo}
									variant={'outline'}
									loading={applyingPromo}
									loadingText={''}
									className="w-24 h-10 py-4 font-medium"
								>
									Appliquer
								</Button>
							</div>
							{price.promo_code && (
								<div className="flex items-center mb-4">
									<p className="flex-1 text-gray-600 mr-2">
										Code appliqué : {price.promo_code.code}
									</p>
									<Button
										onClick={removePromo}
										loading={applyingPromo}
										className="w-24 h-12 font-normal justify-end"
									>
										Retirer
									</Button>
								</div>
							)}
						</div>

						<div className="space-y-3 border-t pt-4">
							<div className="flex justify-between">
								<span className="text-gray-600">Articles</span>
								<span className="font-medium">{price.items / 100} €</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Livraison</span>
								<span className="font-medium">{price.shipping > 0 ? price.shipping / 100 : 0} €</span>
							</div>
							{price.discount && price.discount > 0 && (
								<div className="flex justify-between text-green-700">
									<span>Remise</span>
									<span className="font-medium">- {price.discount / 100} €</span>
								</div>
							)}
						</div>
						<div className="flex justify-between mt-4 pt-4 border-t">
							<span className="font-medium">Total</span>
							<span className="font-bold text-xl">{price.total / 100} €</span>
						</div>
					</div>
					<div className="flex flex-col space-y-2 text-sm text-gray-500">
						<div className="flex items-center">
							<Lock size={14} className="mr-1"/>
							<span>Paiement sécurisé par Stripe</span>
						</div>
						<div className="flex items-center">
							<Truck size={14} className="mr-1"/>
                                                        <span>Expédition sous 2 jours ouvrés</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
