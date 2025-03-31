import {useData} from "vike-react/useData";
import {AssmacResponse} from "@/pages/types";


export function Head() {
	const data = useData<AssmacResponse>();
	const seo = data?.seo
	const serverUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;
	const siteUrl = import.meta.env.PUBLIC_ENV__FRONT_URL as string;
	return (
		<>
			<title>La boutique du assmac</title>

			<meta property="og:type" content={seo?.og?.type || "product"} />
			<meta property="og:title" content={seo?.og?.title || "Assmac | La boutique du Assmac"} />
			<meta property="og:description" content={seo?.og?.description || "La révolution minimaliste pour votre confort en suspension !"} />
			<meta property="og:url" content={siteUrl} />
			<meta property="og:image" content={serverUrl + (seo?.og?.image)} />
			<meta property="og:image:width" content={seo?.og?.image_width || "600"} />
			<meta property="og:image:height" content={seo?.og?.image_height || "450"} />
			<meta property="og:site_name" content={seo?.og?.site_name || "La boutique du Assmac"} />
			<meta property="product:price:amount" content={seo?.og?.price?.amount || "75"} />
			<meta property="product:price:currency" content={seo?.og?.price?.currency || "EUR"} />
			<meta property="og:availability" content={seo?.og?.availability || "instock"} />

			{/* Twitter Card tags */}
			<meta name="twitter:card" content={seo?.twitter?.card || "product"} />
			<meta name="twitter:title" content={seo?.twitter?.title || "Assmac | La boutique du Assmac"} />
			<meta name="twitter:description" content={seo?.twitter?.description || "La révolution minimaliste pour votre confort en suspension !"} />
			<meta name="twitter:image" content={serverUrl + (seo?.twitter?.image)} />
			<meta name="twitter:site" content={seo?.twitter?.site} />
			<meta name="twitter:data1" content={seo?.twitter?.data1 || "75 EUR"} />
			<meta name="twitter:label1" content={seo?.twitter?.label1 || "Prix"} />
			<meta name="twitter:data2" content={seo?.twitter?.data2 || "En stock"} />
			<meta name="twitter:label2" content={seo?.twitter?.label2 || "Disponibilité"} />
		</>
	)
}
