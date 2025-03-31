import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  Layout,

  title: "My Vike App",
  description: "Demo showcasing Vike",

  extends: vikeReact,
} satisfies Config;
