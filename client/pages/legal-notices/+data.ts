// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {LegalNoticesResponse} from "@/pages/types";
import {useConfig} from "vike-react/useConfig";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;

	const config = useConfig()
	config({
		title: "Assmac | Mentions légales"
	})

	const response = await fetch(`${apiUrl}/api/legal-notices`)
	let resp = (await response.json()) as LegalNoticesResponse;


	return resp;
};

