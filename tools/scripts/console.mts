import { styleText } from 'node:util';

export const start = (message: string) => console.log(`${styleText('magenta', '◐')} ${message}`);
export const info = (message: string) => console.log(`${styleText('cyan', 'ℹ')} ${message}`);
export const error = (message: string) => console.error(`\n${styleText(['white', 'bgRed'], ' ERROR ')} ${message}\n`);
export const warn = (message: string) => console.error(`\n${styleText(['black', 'bgYellow'], ' WARN ')} ${message}\n`);
export const success = (message: string) => console.error(`${styleText(['green'], '✔')} ${message}`);

type BoxProps = {
  title: string;
  message: string;
  style: {
    borderColor?: Parameters<typeof styleText>[0];
  };
};

export const box = ({ title, message, style = {} }: BoxProps) => {
  const borderColor = style.borderColor || 'black';
  const visualWidth = Math.max(message.replace(/\u001b\[[0-9;]*m/g, '').length + 4, 40);
  const topBorder = styleText(borderColor, ` ╭─ ${title} ` + '─'.repeat(visualWidth - (title.length + 3)) + '╮');
  const bottomBorder = styleText(borderColor, ' ╰' + '─'.repeat(visualWidth) + '╯');
  const verticalBar = styleText(borderColor, '│');
  const wrapper = ` ${verticalBar}  ${' '.repeat(visualWidth - 4)}  ${verticalBar}`;

  console.log(topBorder);
  console.log(wrapper);
  console.log(` ${verticalBar}  ${message}  ${verticalBar}`);
  console.log(wrapper);
  console.log(bottomBorder);
};
