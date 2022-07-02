const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['brave-people-3.s3.ap-northeast-2.amazonaws.com'],
  },
  env: {
    BASE_SERVER_URL:
      process.env.NODE_ENV === 'production' ? 'https://real-brave-people.o-r.kr' : 'https://dev-brave-people.o-r.kr',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
