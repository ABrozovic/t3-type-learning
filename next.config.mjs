// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const CopyWebpackPlugin = require("copy-webpack-plugin");
import CopyWebpackPlugin from "copy-webpack-plugin";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  webpack: (config) => {
    config.plugins = [
      ...config.plugins,
      // new CopyWebpackPlugin({
      //   patterns: [{ from: "node_modules/@types/", to: "./public/types" }],
      // }),
    ];
    return config;
  },
};
export default config;
