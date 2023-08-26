/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["avatars.githubusercontent.com", "vercel.com"],
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/ugened47/flex-studio",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
