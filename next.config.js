/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  webpack: (config, { isServer }) => {
    // Handle Three.js and WebGL modules
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: 'raw-loader',
    });

    // Handle GLB files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });

    // Handle Three.js modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/jsm': 'three/examples/jsm',
    };

    // Disable server-side rendering for certain modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
      };
    }

    // Ignore specific modules that cause issues
    config.externals = config.externals || [];
    config.externals.push({
      'three/examples/jsm/loaders/GLTFLoader': 'commonjs three/examples/jsm/loaders/GLTFLoader',
    });

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
