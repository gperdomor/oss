import { remarkImage } from 'fumadocs-core/mdx-plugins';
import { remarkInstall } from 'fumadocs-docgen';
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const remarkInstallOptions = {
  persist: {
    id: 'package-manager',
  },
};

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [[remarkInstall, remarkInstallOptions], remarkImage],
  },
});
