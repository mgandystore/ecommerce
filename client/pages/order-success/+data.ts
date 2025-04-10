// https://vike.dev/data

import type {PageContextServer} from "vike/types";
import {useConfig} from "vike-react/useConfig";
import {AssmacResponse, BaseData, SalesTermsResponse} from "@/pages/types";
import {AssmacAPI} from "@/lib/assmac_client";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
	const apiUrl = import.meta.env.PUBLIC_ENV__SRV_URL as string;

	const config = useConfig()
	config({
		title: "Assmac | ✅ Achat validé",
	})

	const response = await new AssmacAPI().settings();

	return response;
};

