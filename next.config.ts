import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /** ルートURLを既定ロケールへ寄せる */
  async redirects() {
    return [{ source: "/", destination: "/ja", permanent: false }];
  },
};

const hasSentryDsn =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) || Boolean(process.env.SENTRY_DSN);

const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
};

export default hasSentryDsn
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
