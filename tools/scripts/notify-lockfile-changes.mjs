import { consola } from 'consola';

const isEven = (num) => num % 2 === 0;

if (process.argv.slice(2).some((arg) => arg.includes('pnpm-lock.yaml'))) {
  const title = ' Warning ';
  const message = 'pnpm-lock.yaml changed, please run `pnpm install` to ensure your packages are up to date.';
  const boxWidth = Math.max(message.length, 10); // minimum box width of 10
  consola.box({
    title: title + '─'.repeat(boxWidth - (title.length + (isEven(boxWidth) ? 1 : 2))),
    message: 'pnpm-lock.yaml changed, please run `pnpm install` to ensure your packages are up to date.',
    style: {
      borderColor: 'yellow',
    },
  });
}
