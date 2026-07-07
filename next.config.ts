import type { NextConfig } from "next";
import { ALLOWED_IMAGE_REMOTE_PATTERNS } from "./lib/config/image-domains";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_REMOTE_PATTERNS,
  },
};

export default nextConfig;
