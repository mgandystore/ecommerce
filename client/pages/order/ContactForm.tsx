import React, {useState} from 'react';
import {Input} from "@/components/ui/input";
import {ActionOrderState, OrderState} from "@/pages/order/reducer";
import {cn} from "@/lib/utils";
import PhoneInput from "@/components/PhoneNumber";

interface ContactFormProps {
	state: OrderState,
	dispatcher: (action: (ActionOrderState)) => void
}

export default function ContactForm({state, dispatcher}: ContactFormProps) {

	return (
		<div className="space-y-4">
			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
					Email
				</label>
				<Input
					type="email"
					id="email"
					value={state.customer.email}
					onChange={(e) => dispatcher({type: 'update_customer', data: {email: e.target.value}})}
					placeholder="ton.email@example.com"
					className={cn(
						state.errors.customer?.email ? 'border-red-500 border-2' : '',
					)}
					required
				/>
				{state.errors.customer?.email && (
					<p className="text-red-500 text-sm mt-1">
						{state.errors.customer.email[0]}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
					Nom complet
				</label>
				<Input
					type="text"
					id="name"
					value={state.customer.full_name}
					onChange={(e) => dispatcher({type: 'update_customer', data: {full_name: e.target.value}})}
					placeholder="John Doe"
					className={cn(state.errors.customer?.full_name ? 'border-red-500 border-2' : '')}
					required
				/>
				{state.errors.customer?.full_name && (
					<p className="text-red-500 text-sm mt-1">
						{state.errors.customer.full_name[0]}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
					Numéro de téléphone
				</label>
				<PhoneInput
					errors={state.errors.customer?.phone}
					value={state.customer.phone}
					onChange={(e) => dispatcher({type: 'update_customer', data: {phone: e.target.value}})}
					placeholder="06 89 55 09 45"
					id="phone"
					/>
			</div>
		</div>
	);
};
