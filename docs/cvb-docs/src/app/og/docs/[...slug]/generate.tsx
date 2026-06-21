import type { ImageSource } from '@takumi-rs/core';
import type { ImageResponseOptions } from '@takumi-rs/image-response';
import { readFile } from 'node:fs/promises';
import type { ReactNode } from 'react';

export interface GenerateProps {
  title: ReactNode;
  description?: ReactNode;
}

const logo = readFile('./src/app/icon.svg');

const font = readFile('./src/lib/og/HubotSansCondensed-Regular.otf').then((data) => ({
  name: 'Hubot',
  data,
  weight: 400,
}));
const fontBold = readFile('./src/lib/og/HubotSansCondensed-Bold.otf').then((data) => ({
  name: 'Hubot',
  data,
  weight: 600,
}));

export async function getImageResponseOptions(): Promise<ImageResponseOptions> {
  const persistentImages: ImageSource[] = [
    {
      src: 'cvb-logo',
      data: await logo,
    },
  ];

  return {
    width: 1200,
    height: 630,
    format: 'webp',
    fonts: await Promise.all([font, fontBold]),
    persistentImages,
  };
}

export function generate({ title, description }: GenerateProps) {
  const siteName = 'Class Variance Builder';
  const primaryColor = 'rgba(255,50,255,0.7)';
  const primaryTextColor = 'rgb(240,240,240)';

  return (
    <div
      tw={`flex flex-col w-full h-full text-white bg-[#0c0c0c] bg-linear-to-tr from-[${primaryColor}] to-transparent`}
    >
      <div tw="flex flex-col w-full h-full p-16">
        <span tw="text-8xl font-semibold">{title}</span>
        <p tw="text-6xl text-[rgba(240,240,240,0.7)]">{description}</p>
        <div tw={`flex flex-row items-center gap-6 mt-auto text-[${primaryTextColor}]`}>
          <img src="cvb-logo" tw="size-15" />
          <span tw="text-5xl font-semibold">{siteName}</span>
        </div>
      </div>
    </div>
  );
}
