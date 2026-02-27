import type { Metadata } from 'next/types';
import { Page } from './source';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: 'https://class-variance-builder.vercel.app',
      siteName: 'Class Variance Builder',
      type: 'website',
      images: [
        { url: '/banner.png', width: 1200, height: 630 },
        {
          url: '/banner-alt.png',
          width: 1200,
          height: 630,
          alt: 'Alternative banner',
        },
        {
          url: '/banner-logo.png',
          width: 1200,
          height: 630,
          alt: 'Banner menu',
        },
      ],
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@gperdomor',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/banner.png',
      ...override.twitter,
    },
    // alternates: {
    //   types: {
    //     'application/rss+xml': [
    //       {
    //         title: 'Class Variance Builder Blog',
    //         url: 'https://class-variance-builder.vercel.app/blog/rss.xml',
    //       },
    //     ],
    //   },
    //   ...override.alternates,
    // },
  };
}

export function getPageImage(page: Page) {
  const segments = [...page.slugs, 'image.webp'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
