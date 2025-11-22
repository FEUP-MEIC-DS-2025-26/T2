import { createModuleFederationConfig } from "@module-federation/rsbuild-plugin";

export default createModuleFederationConfig({
  name: "mips_host",
  remotes: {
    mips_product_page_provider:
      "mips_product_page@http://localhost:3101/mf-manifest.json",
    mips_shopping_cart_provider:
      "mips_shopping_cart@http://localhost:3102/mf-manifest.json",
  },
  shareStrategy: "loaded-first",
  shared: {
    react: {
      singleton: true,
      requiredVersion: "^18.0.0",
    },
    "react-dom": {
      singleton: true,
      requiredVersion: "^18.0.0",
    },
    "@emotion/react": {
      singleton: true,
      requiredVersion: "^11.0.0",
    },
  },
});
