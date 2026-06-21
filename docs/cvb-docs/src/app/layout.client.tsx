'use client';

import Logo from '@/app/icon.svg';
import Image from 'next/image';

export function CVBIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Image src={Logo} alt="Logo" width={20} height={20} />;
}
