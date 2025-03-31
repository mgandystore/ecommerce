// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse} from "@/pages/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	// https://vike.dev/useConfig
	const config = useConfig();
	const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;

	console.log("API URL", apiUrl)

	const response = await fetch(`${apiUrl}/api/assmac`)
	let resp = (await response.json()) as AssmacResponse;

	console.log(resp)

	config({
		title: "La boutique du Assmac",
		description: resp.setting.short_desc,
		lang: "fr",
	})

	return resp;
};

