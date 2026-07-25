import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PFAuto',
    short_name: 'PFAuto',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2EEE3',
    theme_color: '#D7FF4C',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
