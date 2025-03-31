// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse, SalesTermsResponse} from "@/pages/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	// https://vike.dev/useConfig
	const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;

	const config = useConfig()
	config({
		title: "Assmac | Condition genérale de vente",
	})

	const response = await fetch(`${apiUrl}/api/sales-terms`)
	let resp = (await response.json()) as SalesTermsResponse;

	return resp;
};

