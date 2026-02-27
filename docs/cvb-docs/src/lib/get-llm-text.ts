import { type Page } from '@/lib/source';

export async function getLLMText(page: Page) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}
URL: ${page.url}
Source: https://raw.githubusercontent.com/gperdomor/oss/refs/heads/main/docs/cvb-docs/content/docs/${page.path}

${page.data.description ?? ''}

${processed}`;
}
