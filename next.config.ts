import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages のサブディレクトリデプロイに対応（本番ビルド時のみ適用）
  basePath: process.env.NODE_ENV === 'production' ? '/lifeplan-simulator' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
