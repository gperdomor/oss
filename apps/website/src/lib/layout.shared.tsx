import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
            <circle cx={12} cy={12} r={12} fill="currentColor" />
          </svg>
          Nx Tools
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [],
  };
}
