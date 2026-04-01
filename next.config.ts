import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** ルートURLを既定ロケールへ寄せる */
  async redirects() {
    return [{ source: "/", destination: "/ja", permanent: false }];
  },
};

export default nextConfig;
