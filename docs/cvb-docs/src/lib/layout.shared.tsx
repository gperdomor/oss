import { CVBIcon } from '@/app/layout.client';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <CVBIcon className="size-5" aria-label="Class Variance Builder" />
          <span className="font-medium">Class Variance Builder</span>
        </>
      ),
    },
  };
}
