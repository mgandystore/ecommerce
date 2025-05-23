// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse} from "@/pages/types";
import {AssmacAPI} from "@/lib/assmac_client";
import {render} from "vike/abort";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	// https://vike.dev/useConfig
	const config = useConfig();

	const resp = await new AssmacAPI().product();
	if (!resp) {
		render(404, 'Error fetching product data');
		return;
	}

	config({
		title: "La boutique du Assmac",
		description: resp.setting.short_desc,
		lang: "fr",
	})

	console.log("RESPONSE DEBUG", resp)

	return resp as AssmacResponse;
};

