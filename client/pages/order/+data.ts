// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacAPI} from "@/lib/assmac_client";
import { render } from 'vike/abort'

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	const config = useConfig();

	const resp = await new AssmacAPI().findOrderById(pageContext.routeParams.id);
	if (!resp) {
		render(404, 'Error fetching product data');
		return
	}

	config({
		title: "Paiement sécurisé | Assmac",
		description: resp.setting.short_desc,
		lang: "fr",
	})

	return resp;
};

