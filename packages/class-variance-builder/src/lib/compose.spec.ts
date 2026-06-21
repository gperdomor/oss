import { compose, cvb } from './cvb.js';

const box = cvb({
  variants: {
    shadow: {
      sm: 'shadow-sm',
      md: 'shadow-md',
    },
  },
  defaultVariants: {
    shadow: 'sm',
  },
});

const stack = cvb({
  variants: {
    gap: {
      unset: null,
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
    },
  },
  defaultVariants: {
    gap: 'unset',
  },
});

const baseButton = cvb({
  base: 'font-semibold py-1 px-3',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-md',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const roundedButton = cvb({
  base: 'rounded-md',
  variants: {},
});

const coloredButton = cvb({
  variants: {
    color: {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500',
    },
  },
  defaultVariants: {
    color: 'blue',
  },
});

describe('compose', () => {
  it('1 - should merge into a single component', () => {
    const card = compose(box, stack);

    expectTypeOf(card).toBeFunction();
    expectTypeOf(card).parameter(0).toExtend<
      | {
          shadow?: 'sm' | 'md' | undefined;
          gap?: 'unset' | 1 | 2 | 3 | undefined;
        }
      | undefined
    >();

    expect(card({})).toBe('shadow-sm');
    expect(card({ class: 'adhoc-class' })).toBe('shadow-sm adhoc-class');
    expect(card({ className: 'adhoc-class' })).toBe('shadow-sm adhoc-class');
    expect(card({ shadow: 'md' })).toBe('shadow-md');
    expect(card({ gap: 2 })).toBe('shadow-sm gap-2');
    expect(card({ shadow: 'md', gap: 3, class: 'adhoc-class' })).toBe('shadow-md gap-3 adhoc-class');
    expect(card({ shadow: 'md', gap: 3, className: 'adhoc-class' })).toBe('shadow-md gap-3 adhoc-class');
  });

  it('2 - should merge into a single component', () => {
    const rounded = compose(baseButton, roundedButton);

    expectTypeOf(rounded).toBeFunction();
    expectTypeOf(rounded).parameter(0).toExtend<
      | {
          size?: 'sm' | 'md' | undefined;
        }
      | undefined
    >();

    expect(rounded({})).toBe('font-semibold py-1 px-3 text-md rounded-md');
    expect(rounded({ size: 'sm' })).toBe('font-semibold py-1 px-3 text-sm rounded-md');
    expect(rounded({ size: 'md' })).toBe('font-semibold py-1 px-3 text-md rounded-md');
    expect(rounded({ size: 'sm', class: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-sm rounded-md adhoc-class',
    );
    expect(rounded({ size: 'md', className: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md adhoc-class',
    );
    expect(rounded({ class: 'adhoc-class' })).toBe('font-semibold py-1 px-3 text-md rounded-md adhoc-class');
    expect(rounded({ className: 'adhoc-class' })).toBe('font-semibold py-1 px-3 text-md rounded-md adhoc-class');
  });

  it('3 - should merge into a single component', () => {
    const rounded = compose(baseButton, roundedButton);
    const colored = compose(rounded, coloredButton);

    expectTypeOf(rounded).toBeFunction();
    expectTypeOf(rounded).parameter(0).toExtend<
      | {
          size?: 'sm' | 'md' | undefined;
          color?: 'blue' | 'red' | 'indigo' | undefined;
        }
      | undefined
    >();

    expect(colored({})).toBe('font-semibold py-1 px-3 text-md rounded-md bg-blue-500');
    expect(colored({ size: 'sm' })).toBe('font-semibold py-1 px-3 text-sm rounded-md bg-blue-500');
    expect(colored({ size: 'md', color: 'indigo' })).toBe('font-semibold py-1 px-3 text-md rounded-md bg-indigo-500');
    expect(colored({ size: 'sm', color: 'red' })).toBe('font-semibold py-1 px-3 text-sm rounded-md bg-red-500');
    expect(colored({ size: 'sm', color: 'red', class: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-sm rounded-md bg-red-500 adhoc-class',
    );
    expect(colored({ size: 'md', color: 'blue', className: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-class',
    );
    expect(colored({ class: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-class',
    );
    expect(colored({ className: 'adhoc-classname' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-classname',
    );
  });

  it('4 - should merge into a single component', () => {
    const roundedAndColored = compose(baseButton, roundedButton, coloredButton);

    expectTypeOf(roundedAndColored).toBeFunction();
    expectTypeOf(roundedAndColored).parameter(0).toExtend<
      | {
          size?: 'sm' | 'md' | undefined;
          color?: 'blue' | 'red' | 'indigo' | undefined;
        }
      | undefined
    >();

    expect(roundedAndColored({})).toBe('font-semibold py-1 px-3 text-md rounded-md bg-blue-500');
    expect(roundedAndColored({ size: 'sm' })).toBe('font-semibold py-1 px-3 text-sm rounded-md bg-blue-500');
    expect(roundedAndColored({ size: 'md', color: 'indigo' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-indigo-500',
    );
    expect(roundedAndColored({ size: 'sm', color: 'red' })).toBe(
      'font-semibold py-1 px-3 text-sm rounded-md bg-red-500',
    );
    expect(roundedAndColored({ size: 'sm', color: 'red', class: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-sm rounded-md bg-red-500 adhoc-class',
    );
    expect(roundedAndColored({ size: 'md', color: 'blue', className: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-class',
    );
    expect(roundedAndColored({ class: 'adhoc-class' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-class',
    );
    expect(roundedAndColored({ className: 'adhoc-classname' })).toBe(
      'font-semibold py-1 px-3 text-md rounded-md bg-blue-500 adhoc-classname',
    );
  });
});
