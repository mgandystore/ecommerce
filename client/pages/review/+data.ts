// https://vike.dev/data

import type { PageContextServer } from "vike/types";
import { useConfig } from "vike-react/useConfig";
import { AssmacAPI } from "@/lib/assmac_client";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig();
  config({
    title: "Assmac | Donnez votre avis",
    description: "Deposer un avis apres une commande Assmac.",
  });

  const token = pageContext.routeParams.token;

  // Load settings for layout
  const settings = await new AssmacAPI().settings();

  return {
    token,
    setting: settings?.setting || {},
  };
};
