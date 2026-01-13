// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Imperial Script",
        cssVariable: "--font-title"
      },
      {
        provider: fontProviders.google(),
        name: "Geist",
        cssVariable: "--font-body"
      }
    ],
  },

  output: "server",
  adapter: netlify(),
});