import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        domains: ['firebasestorage.googleapis.com'],
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
