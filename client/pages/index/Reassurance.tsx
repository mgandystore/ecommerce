import React from 'react';
import { Check, ShieldCheck, UndoDot, Lock, Truck, RotateCcw } from 'lucide-react';

// Icon mapping object for both components
const iconMap : Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
	truck: Truck,
	shield: ShieldCheck,
	'rotate-ccw': RotateCcw,
	lock: Lock,
};

export function ProductReassurance() {
	const features = [
		{ icon: 'truck', text: "Expédition sous 24h" },
		{ icon: 'shield', text: "Garantie 2 ans" },
		{ icon: 'rotate-ccw', text: "Retour 30 jours" },
		{ icon: 'lock', text: "Paiement sécurisé" }
	];

	return (
		<div className="bg-white rounded-lg p-4 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
			{features.map((feature, index) => {
				const IconComponent = iconMap[feature.icon];
				return (
					<div key={index} className="flex items-center gap-2">
						<IconComponent className="w-4 h-4" />
						<span className="text-sm text-gray-600">{feature.text}</span>
					</div>
				);
			})}
		</div>
	);
}

export function FooterReassurance() {
	const badges = [
		{
			icon: 'truck',
			title: 'Livraison rapide',
			text: 'Expédition sous 24h pour toutes les commandes'
		},
		{
			icon: 'shield',
			title: 'Garantie produit',
			text: 'Tous nos produits sont garantis 2 ans'
		},
		{
			icon: 'rotate-ccw',
			title: 'Retours gratuits',
			text: 'Retour sans frais sous 30 jours'
		},
		{
			icon: 'lock',
			title: 'Paiement sécurisé',
			text: 'Transactions cryptées et sécurisées'
		}
	];

	return (
		<div className="bg-gray-50 py-12 border-t border-gray-200">
			<div className="max-w-screen-2xl mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{badges.map((badge, index) => {
						const IconComponent = iconMap[badge.icon];
						return (
							<div key={index} className="flex flex-col items-center text-center">
								<IconComponent className="w-8 h-8 text-emerald-700 mb-2" />
								<h3 className="text-stone-950 font-bold text-sm">{badge.title}</h3>
								<p className="text-gray-500 text-xs">{badge.text}</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};


