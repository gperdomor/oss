import nxScopes from '@commitlint/config-nx-scopes';
import { type UserConfig, RuleConfigSeverity } from '@commitlint/types';

const { utils } = nxScopes;

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],
  rules: {
    // @ts-expect-error nx-scopes is not typed
    'scope-enum': async (ctx) => [
      RuleConfigSeverity.Error,
      'always',
      ['deps', 'release', ...(await utils.getProjects(ctx))],
    ],
  },
};

export default Configuration;
