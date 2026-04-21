import nxScopes from '@commitlint/config-nx-scopes';
import { defineConfig } from 'czg';

const { utils } = nxScopes;

export default defineConfig({
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],
  rules: {
    // @ts-expect-error nx-scopes is not typed
    'scope-enum': async (ctx) => [2, 'always', ['repo', 'deps', 'release', ...(await utils.getProjects(ctx))]],
  },
  prompt: {
    useAI: false,
    aiNumber: 5,
    aiDiffIgnore: ['pnpm-lock.yaml'],
    aiQuestionCB: ({ maxSubjectLength, diff }) =>
      `For the following Git diff code, please write an insightful and concise Git commit message in the imperative mood without a prefix. Note that the length of this sentence must not exceed ${maxSubjectLength} characters!! : \n\`\`\`diff\n${diff}\n\`\`\``,
  },
});
