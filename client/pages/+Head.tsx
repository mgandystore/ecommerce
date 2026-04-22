// https://vike.dev/Head

import React from "react";
import logoUrl from "../assets/logo.svg";
import {usePageContext} from "vike-react/usePageContext";

export default function HeadDefault() {
  const pageContext = usePageContext() as { urlPathname?: string };
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const siteUrl = (
    (typeof process !== "undefined" ? process.env.PUBLIC_ENV__FRONT_URL : undefined) ||
    metaEnv?.PUBLIC_ENV__FRONT_URL ||
    "https://assmac.com"
  ).replace(/\/$/, "");
  const pathname = pageContext.urlPathname || "/";
  const canonicalUrl = `${siteUrl}${pathname === "/" ? "/" : pathname}`;

  return (
    <>
      <link rel="icon" href={logoUrl}/>
      <link rel="canonical" href={canonicalUrl}/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        rel="stylesheet"/>
    </>
  );
}
