import type { Interfaces } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type OclifConfig = NonNullable<Interfaces.PJSON['oclif']>;

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as Interfaces.PJSON;

/**
 * Creates the options object for loading the CLI configuration, transforming paths from the 'dist' directory to the 'src' directory for commands and hooks.
 * This is useful for development purposes, allowing the CLI to run directly from the source code without needing to build it first.
 *
 * This should not be used in production, as it bypasses the build process and may lead to unexpected behavior if the source code is not in a stable state.
 *
 * @returns {Interfaces.Options} The options object containing the root path and modified package.json configuration.
 */
export const createLoadOptions = (): Interfaces.Options => {
  const oclifConfig = packageJson.oclif as OclifConfig;

  const hooks: Record<string, string | string[]> = {};
  for (const [event, hook] of Object.entries(oclifConfig.hooks ?? {})) {
    hooks[event] = Array.isArray(hook)
      ? hook.map((h) => (h as string).replace('./dist/', './src/'))
      : (hook as string).replace('./dist/', './src/');
  }

  return {
    root,
    pjson: {
      ...packageJson,
      oclif: {
        ...packageJson.oclif,
        commands: (oclifConfig.commands as string)?.replace('./dist/', './src/'),
        hooks,
      },
    },
  };
};
