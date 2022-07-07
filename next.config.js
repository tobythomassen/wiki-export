/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: "dist",
  cleanDistDir: true,
  rewrites: async () => ({
    fallback: [
      {
        source: "/:path*",
        destination: "/"
      }
    ]
  })
}

module.exports = nextConfig
