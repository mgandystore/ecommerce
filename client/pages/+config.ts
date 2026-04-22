import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  Layout,

  title: "Assmac",
  description: "Hamac ultra-leger pour les relais en grande voie et les ascensions verticales.",

  extends: vikeReact,
} satisfies Config;
