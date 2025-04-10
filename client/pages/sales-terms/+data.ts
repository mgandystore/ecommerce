// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse, SalesTermsResponse} from "@/pages/types";
import {AssmacAPI} from "@/lib/assmac_client";
import {render} from "vike/abort";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	const config = useConfig()
	config({
		title: "Assmac | Condition genérale de vente",
	})

	const response = await new AssmacAPI().salesTerms();
	if (!response) {
		render(404, '404 Not Found')
	}

	return response as SalesTermsResponse;
};

