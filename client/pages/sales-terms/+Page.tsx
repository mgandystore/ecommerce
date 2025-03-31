import React from "react";
import {useData} from "vike-react/useData";
import {Data} from "@/pages/sales-terms/+data";


export default function Page() {
	const data = useData<Data>()
	return (
		<main>
			<div className="bg-white">
				<div className="max-w-screen-2xl mx-auto py-12 px-6">
					<h1 className="text-3xl font-bold text-emerald-700 mb-8">
						Conditions Générales de Vente
					</h1>

					<div className="prose prose-emerald max-w-none" dangerouslySetInnerHTML={{__html: data.value}}/>
				</div>
			</div>
		</main>
	);
}
