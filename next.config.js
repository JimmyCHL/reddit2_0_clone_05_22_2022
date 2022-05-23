/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['links.papareact.com', 'avatars.dicebear.com'],
  },
  env: {
    STEPZEN_URI: process.env.STEPZEN_URI,
    STEPZEN_APIKEY: process.env.STEPZEN_APIKEY,
  },
}
