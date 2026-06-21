import { getPageImage, source } from '@/lib/source';
import { ImageResponse } from '@takumi-rs/image-response';
import { notFound } from 'next/navigation';
import { generate as MetadataImage, getImageResponseOptions } from './generate';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <MetadataImage title={page.data.title} description={page.data.description} />,
    await getImageResponseOptions(),
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
