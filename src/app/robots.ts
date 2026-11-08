import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/crm', '/api/admin'],
      },
    ],
    sitemap: 'https://www.siteon.cl/sitemap.xml',
  };
}

