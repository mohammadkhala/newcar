import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "admin.newcarpal.com", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
