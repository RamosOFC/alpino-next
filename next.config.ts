import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alpinolinhas.com.br",
        pathname: "/wp-content/uploads/**",
      },
    ],
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
  },
  // Necessário para o adapter MariaDB do Prisma (usa módulos Node.js nativos)
  serverExternalPackages: ["@prisma/adapter-mariadb"],
}

export default nextConfig
