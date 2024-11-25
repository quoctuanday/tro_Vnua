import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
            { protocol: 'https', hostname: 'img.iproperty.com.my' },
            { protocol: 'https', hostname: 'cdn.tuoitre.vn' },
        ],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/home',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
