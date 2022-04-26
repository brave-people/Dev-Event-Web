const nextConfig = {
  reactStrictMode: true,
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
