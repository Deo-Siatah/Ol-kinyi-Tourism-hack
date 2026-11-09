// Vite config: resolves MindAR's bare Three.js imports to the vendored module builds.

import { fileURLToPath, URL } from "node:url";

export default {
  resolve: {
    alias: [
      {
        find: /^three$/,
        replacement: fileURLToPath(new URL("./vendor/three.module.min.js", import.meta.url)),
      },
      {
        find: /^three\/addons\//,
        replacement: fileURLToPath(new URL("./vendor/addons/", import.meta.url)),
      },
    ],
  },
};
