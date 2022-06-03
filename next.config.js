const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['brave-people-3.s3.ap-northeast-2.amazonaws.com'],
  },
  env: {
    BASE_SERVER_URL: 'https://dev-brave-people.o-r.kr',
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
