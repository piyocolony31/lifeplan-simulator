import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages のサブディレクトリデプロイに対応
  basePath: '/lifeplan-simulator',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
