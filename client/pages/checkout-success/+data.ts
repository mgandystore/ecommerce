// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse, BaseData, SalesTermsResponse} from "@/pages/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	// https://vike.dev/useConfig
	const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;

	const config = useConfig()
	config({
		title: "Assmac | ✅ Achat validé",
	})

	const response = await fetch(`${apiUrl}/api/settings`)
	console.log("response", response);
	let resp = await (response.json()) as BaseData;

	return resp;
};

