import React from "react";
import {useData} from "vike-react/useData";
import {Data} from "@/pages/checkout-success/+data";
import {BellDot, Check, Mail, Truck} from "lucide-react";

export default function Page() {
	const data = useData<Data>()
	return (
		<main className="min-h-screen flex-grow flex items-center justify-center bg-gray-50 py-12">
			<div className="max-w-screen-lg w-full px-4 sm:px-6">
				<div className="bg-white rounded-xl shadow-md p-5 sm:p-8">
					<div className="flex flex-col items-center justify-center text-center mb-10">
						<div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
							<Check/>
						</div>

						<h1 className="text-3xl font-bold text-emerald-700 mb-3">
							Commande confirmée !
						</h1>

						<p className="text-lg text-gray-600 max-w-xl">
							Votre commande a été enregistrée avec succès. Un email de confirmation vous sera envoyé dans les
							prochaines minutes.
						</p>
					</div>

					{/* Desktop progress steps */}
					<div className="mb-12 hidden md:block">
						<div className="flex items-center justify-between w-full mb-2">
							<div className="flex flex-col items-center">
								<div
									className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold mb-2">
									1
								</div>
								<span className="text-sm font-medium text-emerald-700">Commande créée</span>
							</div>

							<div className="flex-1 h-1 bg-gray-200 mx-2 relative -top-3">
								<div className="h-full bg-emerald-700 w-full"></div>
							</div>

							<div className="flex flex-col items-center">
								<div
									className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
									2
								</div>
								<span className="text-sm font-medium text-gray-500">Expédition</span>
							</div>

							<div className="flex-1 h-1 bg-gray-200 mx-2 relative -top-3">
								<div className="h-full bg-gray-300 w-0"></div>
							</div>

							<div className="flex flex-col items-center">
								<div
									className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
									3
								</div>
								<span className="text-sm font-medium text-gray-500">Livraison</span>
							</div>
						</div>
					</div>

					{/* Mobile progress steps */}
					<div className="mb-8 md:hidden">
						<div className="flex flex-col space-y-6">
							<div className="flex items-start">
								<div className="relative">
									<div
										className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold z-10">
										1
									</div>
									<div className="absolute top-10 left-1/2 w-1 h-full -ml-0.5 bg-emerald-700 z-0"></div>
								</div>
								<div className="ml-4">
									<p className="font-medium text-emerald-700">Commande créée</p>
									<p className="text-sm text-gray-500">Votre commande a été enregistrée</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="relative">
									<div
										className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold z-10">
										2
									</div>
									<div className="absolute top-10 left-1/2 w-1 h-full -ml-0.5 bg-gray-200 z-0"></div>
								</div>
								<div className="ml-4">
									<p className="font-medium text-gray-500">Expédition</p>
									<p className="text-sm text-gray-500">Votre colis est en préparation</p>
								</div>
							</div>

							<div className="flex items-start">
								<div>
									<div
										className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
										3
									</div>
								</div>
								<div className="ml-4">
									<p className="font-medium text-gray-500">Livraison</p>
									<p className="text-sm text-gray-500">Votre colis sera bientôt livré</p>
								</div>
							</div>
						</div>
					</div>

					{/* Order tracking section */}
					<div className="bg-gray-50 p-6 rounded-lg mb-8">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Suivi de votre commande</h2>

						<div className="space-y-4 text-gray-600">
							<div className="flex items-start space-x-3">
								<Mail className="flex-shrink-0 mt-1 text-gray-500"/>
								<div>
									<p className="font-medium">Email de confirmation</p>
									<p className="text-sm">Vous recevrez un email récapitulatif de votre commande.</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<BellDot className="flex-shrink-0 mt-1 text-gray-500"/>
								<div>
									<p className="font-medium">Notification d'expédition</p>
									<p className="text-sm">Un email vous sera envoyé dès que votre commande sera expédiée.</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<Truck className="flex-shrink-0 mt-1 text-gray-500"/>
								<div>
									<p className="font-medium">Confirmation de livraison</p>
									<p className="text-sm">Nous vous informerons lorsque votre commande aura été livrée.</p>
								</div>
							</div>
						</div>

						<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
							<p className="text-blue-800 text-sm">
								<span className="font-medium">Conseil :</span> Si vous ne recevez pas nos emails, n'oubliez pas de
								vérifier votre dossier de courriers indésirables. Nous faisons tout notre possible pour vous tenir
								informé à chaque étape !
							</p>
						</div>
					</div>

					{/* Contact and return section */}
					<div className="border-t border-gray-200 pt-6 text-center">
						<p className="text-gray-600 mb-6">
							Une question ? N'hésitez pas à me contacter à l'addresse suivante :
							<a href={`mailto:${data.setting.contact_mail || 'martin@assmac.com'}`}
								 className="text-emerald-700 font-medium hover:underline ml-1">
								{data.setting.contact_mail || 'martin@assmac.com'}
							</a>
						</p>

						<a href="/"
							 className="inline-flex items-center justify-center px-8 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition duration-200">
							Retour à la boutique
						</a>
					</div>
				</div>
			</div>
		</main>
	);
}
