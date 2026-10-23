import { styleText } from 'node:util';
import { box } from './console.mts';

if (process.argv.slice(2).some((arg) => arg.includes('pnpm-lock.yaml'))) {
  box({
    title: 'Warning',
    message: `pnpm-lock.yaml changed, please run ${styleText('cyan', 'pnpm install')} to ensure your packages are up to date.`,
    style: {
      borderColor: 'yellow',
    },
  });
}
